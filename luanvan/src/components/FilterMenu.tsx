import React from "react";

const filters = [
  {
    title: "Price Range",
    options: ["Under $50", "$50 - $100", "Over $100"],
  },
  {
    title: "Category",
    options: ["Electronics", "Clothing", "Accessories"],
  },
  {
    title: "Brand",
    options: ["Brand A", "Brand B", "Brand C"],
  },
];

const FilterMenu: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h3 className="text-lg font-semibold mb-4">Filter Products</h3>
      <div className="flex flex-col gap-6">
        {filters.map((filter) => (
          <div key={filter.title}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {filter.title}
            </h4>
            <div className="flex flex-col gap-2">
              {filter.options.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox" />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterMenu;
