const StatCardContainer = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 grid-flow-row-dense">
      {stats.map((stat) => {
        return (
          <div className="bg-white border-light p-4 flex items-center justify-between rounded-md">
            <div>
              <div className="text-4xl! font-bold">{stat.value}</div>
              <div className="flex items-center mb-2">
                <div className="flex-1 flex flex-col">
                  <span className="text-sm">{stat.title}</span>
                  <span className="text-xs text-light">{stat.subTitle}</span>
                </div>
              </div>
            </div>
            <div>{stat.icon}</div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCardContainer;
