#!/usr/bin/env python3
"""
Comprehensive unused files analyzer for JavaScript/JSX React project
Analyzes import patterns, exports, and actual usage to identify dead code
"""

import os
import re
import json
import sys
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Set, Tuple

class UnusedFilesAnalyzer:
    def __init__(self, src_dir: str = "src"):
        self.src_dir = Path(src_dir)
        self.files_data = {}
        self.import_graph = defaultdict(set)
        self.export_graph = defaultdict(set)
        self.route_files = set()
        
    def analyze_file(self, file_path: Path) -> Dict:
        """Analyze a single file for imports and exports."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return {"error": "Could not read file", "imports": [], "exports": [], "empty": True}
        
        # Find imports
        import_patterns = [
            r"import\s+.*?\s+from\s+['\"]([^'\"]+)['\"]",
            r"import\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",
            r"require\s*\(\s*['\"]([^'\"]+)['\"]\s*\)"
        ]
        
        imports = []
        for pattern in import_patterns:
            matches = re.findall(pattern, content)
            imports.extend(matches)
        
        # Find exports
        export_patterns = [
            r"export\s+default\s+(\w+)",
            r"export\s+(?:const|let|var|function|class)\s+(\w+)",
            r"export\s+\{\s*([^}]+)\s*\}",
            r"module\.exports\s*=",
        ]
        
        exports = []
        for pattern in export_patterns:
            matches = re.findall(pattern, content)
            if matches:
                if pattern == export_patterns[2]:  # Handle export { ... }
                    for match in matches:
                        exports.extend([name.strip() for name in match.split(',')])
                else:
                    exports.extend(matches)
        
        # Check if file is effectively empty
        code_content = re.sub(r'//.*?\n|/\*.*?\*/|\s+', '', content, flags=re.DOTALL)
        is_empty = len(code_content) < 50  # Very minimal content
        
        return {
            "imports": imports,
            "exports": exports,
            "empty": is_empty,
            "lines": len(content.splitlines()),
            "has_jsx": ".jsx" in str(file_path) or "React" in content,
            "content_preview": content[:200] if content else ""
        }
    
    def scan_files(self) -> None:
        """Scan all JavaScript/TypeScript files in src directory."""
        extensions = ['.js', '.jsx', '.ts', '.tsx']
        
        for file_path in self.src_dir.rglob('*'):
            if file_path.suffix in extensions and file_path.is_file():
                rel_path = str(file_path.relative_to(self.src_dir.parent))
                self.files_data[rel_path] = self.analyze_file(file_path)
                
                # Identify routing files
                if any(keyword in str(file_path).lower() for keyword in ['main.jsx', 'app.jsx', 'router', 'route']):
                    self.route_files.add(rel_path)
    
    def build_dependency_graph(self) -> None:
        """Build import/export dependency graph."""
        for file_path, data in self.files_data.items():
            for import_path in data.get('imports', []):
                # Resolve relative imports
                if import_path.startswith('./') or import_path.startswith('../'):
                    resolved = self.resolve_relative_import(file_path, import_path)
                    if resolved:
                        self.import_graph[file_path].add(resolved)
                elif not import_path.startswith('@') and '/' in import_path and not import_path.startswith('react'):
                    # Local imports without relative path
                    potential_path = f"src/{import_path}"
                    if self.find_matching_file(potential_path):
                        self.import_graph[file_path].add(potential_path)
    
    def resolve_relative_import(self, current_file: str, import_path: str) -> str:
        """Resolve relative import path to absolute path."""
        current_dir = Path(current_file).parent
        
        # Handle different extensions
        potential_files = []
        if not import_path.endswith(('.js', '.jsx', '.ts', '.tsx')):
            for ext in ['.js', '.jsx', '.ts', '.tsx']:
                potential_files.append(str(current_dir / f"{import_path}{ext}"))
                potential_files.append(str(current_dir / import_path / f"index{ext}"))
        else:
            potential_files.append(str(current_dir / import_path))
        
        for potential_file in potential_files:
            if potential_file in self.files_data:
                return potential_file
        
        return None
    
    def find_matching_file(self, path_pattern: str) -> str:
        """Find files matching a path pattern."""
        for file_path in self.files_data.keys():
            if path_pattern in file_path:
                return file_path
        return None
    
    def identify_unused_files(self) -> List[Dict]:
        """Identify potentially unused files."""
        unused_files = []
        
        # Get files imported by routing files
        route_imported = set()
        for route_file in self.route_files:
            route_imported.update(self.import_graph.get(route_file, set()))
        
        # Get all imported files
        all_imported = set()
        for imports in self.import_graph.values():
            all_imported.update(imports)
        
        for file_path, data in self.files_data.items():
            reasons = []
            
            # Check if file is never imported
            if file_path not in all_imported:
                reasons.append("Never imported by any file")
            
            # Check if file has no exports
            if not data.get('exports'):
                reasons.append("Has no exports")
            
            # Check if file is empty or minimal
            if data.get('empty'):
                reasons.append("File is empty or has minimal content")
            
            # Check if it's a test file not in main flow
            if 'test' in file_path.lower() and file_path not in route_imported:
                reasons.append("Test file not in main application flow")
            
            # Check for duplicate patterns
            if self.is_potential_duplicate(file_path):
                reasons.append("Potential duplicate of another file")
            
            if reasons:
                unused_files.append({
                    "file": file_path,
                    "reasons": reasons,
                    "data": data,
                    "size": data.get('lines', 0)
                })
        
        return sorted(unused_files, key=lambda x: len(x['reasons']), reverse=True)
    
    def is_potential_duplicate(self, file_path: str) -> bool:
        """Check if file might be a duplicate based on naming patterns."""
        base_name = Path(file_path).stem
        
        # Look for files with similar names but different suffixes
        patterns = ['New', 'Old', 'Legacy', 'Backup', 'Fixed', 'Refactored', 'Clean', 'Simple']
        
        for pattern in patterns:
            if pattern in base_name:
                # Check if there's a version without this pattern
                clean_name = base_name.replace(pattern, '')
                for other_file in self.files_data.keys():
                    if Path(other_file).stem == clean_name:
                        return True
        
        return False
    
    def find_duplicate_components(self) -> List[Dict]:
        """Find components that might serve the same purpose."""
        duplicates = []
        component_groups = defaultdict(list)
        
        # Group by similar names
        for file_path in self.files_data.keys():
            base_name = Path(file_path).stem
            # Remove common suffixes to group similar components
            clean_name = re.sub(r'(New|Old|Legacy|Fixed|Refactored|Clean|Simple|Wrapper)$', '', base_name)
            if clean_name and clean_name != base_name:
                component_groups[clean_name].append(file_path)
        
        for group_name, files in component_groups.items():
            if len(files) > 1:
                duplicates.append({
                    "group": group_name,
                    "files": files,
                    "details": {f: self.files_data[f] for f in files}
                })
        
        return duplicates
    
    def generate_report(self) -> Dict:
        """Generate comprehensive analysis report."""
        self.scan_files()
        self.build_dependency_graph()
        
        unused_files = self.identify_unused_files()
        duplicates = self.find_duplicate_components()
        
        # Statistics
        stats = {
            "total_files": len(self.files_data),
            "files_with_imports": sum(1 for data in self.files_data.values() if data.get('imports')),
            "files_with_exports": sum(1 for data in self.files_data.values() if data.get('exports')),
            "empty_files": sum(1 for data in self.files_data.values() if data.get('empty')),
            "route_files": len(self.route_files),
            "potentially_unused": len(unused_files)
        }
        
        return {
            "statistics": stats,
            "unused_files": unused_files,
            "duplicate_groups": duplicates,
            "route_files": list(self.route_files),
            "import_graph": {k: list(v) for k, v in self.import_graph.items()},
            "recommendations": self.generate_recommendations(unused_files, duplicates)
        }
    
    def generate_recommendations(self, unused_files: List[Dict], duplicates: List[Dict]) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        # High-priority removals
        high_priority = [f for f in unused_files if len(f['reasons']) >= 2 or f['data'].get('empty')]
        if high_priority:
            recommendations.append(f"SAFE TO DELETE: {len(high_priority)} files with multiple issues or empty content")
        
        # Duplicate consolidation
        if duplicates:
            recommendations.append(f"CONSOLIDATE: {len(duplicates)} groups of duplicate components found")
        
        # Test file cleanup
        test_files = [f for f in unused_files if 'test' in f['file'].lower()]
        if test_files:
            recommendations.append(f"REVIEW: {len(test_files)} test files may be orphaned")
        
        return recommendations

if __name__ == "__main__":
    analyzer = UnusedFilesAnalyzer()
    report = analyzer.generate_report()
    
    print("# Code Quality Analysis Report: Unused Files")
    print(f"**Generated:** {os.path.basename(os.getcwd())}")
    print()
    
    # Statistics
    stats = report['statistics']
    print("## 📊 Project Statistics")
    print(f"- **Total files analyzed:** {stats['total_files']}")
    print(f"- **Files with imports:** {stats['files_with_imports']}")
    print(f"- **Files with exports:** {stats['files_with_exports']}")
    print(f"- **Empty/minimal files:** {stats['empty_files']}")
    print(f"- **Potentially unused files:** {stats['potentially_unused']}")
    print()
    
    # Unused files
    print("## 🗑️ Potentially Unused Files")
    print()
    for file_info in report['unused_files'][:20]:  # Top 20
        print(f"### {file_info['file']}")
        print(f"**Lines:** {file_info['size']}")
        print("**Issues:**")
        for reason in file_info['reasons']:
            print(f"- {reason}")
        print()
    
    # Duplicates
    if report['duplicate_groups']:
        print("## 🔄 Duplicate Component Groups")
        print()
        for dup_group in report['duplicate_groups']:
            print(f"### {dup_group['group']} variants:")
            for file in dup_group['files']:
                data = dup_group['details'][file]
                print(f"- **{file}** ({data.get('lines', 0)} lines)")
            print()
    
    # Recommendations
    print("## 💡 Recommendations")
    for rec in report['recommendations']:
        print(f"- {rec}")
    
    # Save detailed report
    with open('docs/code-analysis/unused-files-detailed.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n📋 **Detailed report saved to:** docs/code-analysis/unused-files-detailed.json")