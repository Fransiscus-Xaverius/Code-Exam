import React from 'react';

export const TabsContext = React.createContext({});

export const Tabs = ({ value, onValueChange, defaultValue, children, className = '' }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '');
  
  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);
  
  const handleTabChange = (tabValue) => {
    if (onValueChange) {
      onValueChange(tabValue);
    } else {
      setActiveTab(tabValue);
    }
  };
  
  return (
    <TabsContext.Provider value={{ value: activeTab, onValueChange: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex gap-1 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className = '' }) => {
  const { value: activeTab, onValueChange } = React.useContext(TabsContext);
  const isActive = activeTab === value;
  
  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={`px-3 py-2 flex items-center justify-center text-sm font-medium transition-colors
      ${isActive 
        ? 'text-blue-600 border-b-2 border-blue-600' 
        : 'text-gray-600 hover:text-gray-800'
      } ${className}`}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '' }) => {
  const { value: activeTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;
  
  if (!isActive) return null;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
};
