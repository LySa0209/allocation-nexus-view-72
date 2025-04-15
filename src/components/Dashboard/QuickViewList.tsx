
import React from 'react';
import { Link } from 'react-router-dom';

interface QuickViewItem {
  id: string;
  title: string;
  subtitle: string;
  value?: string;
  status?: string;
  linkTo: string;
}

interface QuickViewListProps {
  title: string;
  items: QuickViewItem[];
  emptyMessage?: string;
}

const QuickViewList: React.FC<QuickViewListProps> = ({ title, items, emptyMessage = "No items to display" }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <div className="p-4 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          items.map((item) => (
            <Link 
              to={item.linkTo} 
              key={item.id} 
              className="p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
              <div className="flex items-center">
                {item.value && <span className="text-sm font-medium mr-3">{item.value}</span>}
                {item.status && (
                  <span
                    className={`status-badge ${
                      item.status === 'Benched' ? 'status-bench' :
                      item.status === 'Allocated' ? 'status-allocated' :
                      item.status === 'Needs Resources' ? 'status-needed' :
                      'status-pipeline'
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default QuickViewList;
