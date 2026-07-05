import { FiSearch, FiFilter, FiGrid, FiList, FiBookOpen } from 'react-icons/fi';

const CourseSearchFilter = ({
  searchQuery,
  setSearchQuery,
  gradeFilter,
  handleGradeFilter,
  grades,
  sortBy,
  handleSort,
  viewMode,
  setViewMode,
  getUserGrade
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
    {/* Search */}
    <div className="relative mb-8">
      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
      <input
        type="text"
        placeholder="Tìm kiếm khóa học..."
        className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* Grade filter */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FiBookOpen className="text-primary" /> Lọc theo lớp học
      </h3>
      <div className="flex flex-wrap gap-3">
        <button
          className={`px-6 py-3 rounded-2xl border-2 font-semibold transition-all duration-200 ${
            gradeFilter === ''
              ? 'bg-primary text-white border-primary shadow-lg'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
          }`}
          onClick={() => handleGradeFilter('')}
        >
          Tất cả lớp
        </button>

        {grades.map((grade) => {
          const isUserGrade = getUserGrade() === grade;
          const isSelected = gradeFilter === grade;
          return (
            <button
              key={grade}
              className={`px-6 py-3 rounded-2xl border-2 font-semibold transition-all duration-200 relative ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : isUserGrade
                  ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
              }`}
              onClick={() => handleGradeFilter(grade)}
            >
              {grade}
              {isUserGrade && !isSelected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>

    {/* Sort & View */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <FiFilter className="text-gray-500" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Sắp xếp:</span>
        <select
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <option value="default">Mặc định</option>
          <option value="newest">Mới nhất</option>
          <option value="rating">Đánh giá cao</option>
          <option value="students">Nhiều học viên</option>
          <option value="price">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-3 rounded-xl ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700'}`}
        >
          <FiGrid />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-3 rounded-xl ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700'}`}
        >
          <FiList />
        </button>
      </div>
    </div>
  </div>
);

export default CourseSearchFilter;
