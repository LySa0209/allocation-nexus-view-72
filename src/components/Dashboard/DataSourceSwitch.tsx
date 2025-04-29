
import { useDataSource } from '@/context/DataSourceContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WifiOff, Wifi } from 'lucide-react';

export function DataSourceSwitch() {
  const { dataSource, toggleDataSource, isLoading } = useDataSource();
  
  return (
    <div className="flex items-center space-x-2">
      <WifiOff className={`h-4 w-4 ${dataSource === 'mock' ? 'text-primary' : 'text-gray-400'}`} />
      <Switch 
        checked={dataSource === 'api'} 
        onCheckedChange={toggleDataSource}
        disabled={isLoading}
        id="data-source-switch"
      />
      <Wifi className={`h-4 w-4 ${dataSource === 'api' ? 'text-primary' : 'text-gray-400'}`} />
      <Label htmlFor="data-source-switch" className="text-sm text-gray-600">
        {dataSource === 'api' ? 'Using API Data' : 'Using Mock Data'}
        {isLoading && ' (Loading...)'}
      </Label>
    </div>
  );
}
