import { FileSpreadsheet, Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function BatchIssuancePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Batch Credential Issuance</h1>
        <p className="text-sm text-slate-500 mt-0.5">CSV batch processing is planned, but is not available in this prototype.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>No CSV file has been uploaded or processed. Batch issuance, validation, signing, and persistence are not implemented.</p>
      </div>

      <Card className="border-dashed">
        <div className="py-10 text-center">
          <FileSpreadsheet size={28} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No records processed</p>
          <p className="mt-1 text-xs text-slate-500">This prototype does not accept or store batch records.</p>
        </div>
      </Card>
    </div>
  );
}
