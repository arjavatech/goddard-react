// Welcome section with statistics
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, Clock } from 'lucide-react';

const WelcomeSection = ({ parentName, stats }) => {
  if (!stats) return null;

  return (
    <div className="bg-white border-b">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0F2D52] mb-2">
            Parent Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Welcome {parentName}
          </p>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Forms</p>
                    <p className="text-2xl font-bold text-[#0F2D52]">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-[#0F2D52]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.incomplete}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.progress}%</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{stats.progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;