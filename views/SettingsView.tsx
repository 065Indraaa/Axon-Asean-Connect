import React, { useState } from 'react';
import { Eye, EyeOff, Lock, LogOut } from 'lucide-react';
import { Button, Card, Header } from '../components/UIComponents';
import { UserSession } from '../types';

interface SettingsViewProps {
  user: UserSession;
  onLogout: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout, onBack }) => {
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="pb-24 pt-4">
            <Header title="Config" onBack={onBack} />
            <div className="space-y-6 mt-4">
                <Card>
                    <h3 className="font-medium mb-4 text-white">Account Security</h3>
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-xl break-all border border-white/5">
                            <p className="text-[10px] uppercase tracking-wider text-secondary mb-2">Public Key</p>
                            <p className="font-mono text-xs text-white">{user.walletAddress}</p>
                        </div>
                        
                        <div>
                             <Button variant="outline" fullWidth onClick={() => setShowKey(!showKey)} className="mb-2">
                                 {showKey ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                 {showKey ? "Hide Private Key" : "Export Private Key"}
                             </Button>
                             {showKey && (
                                 <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl mt-2 animate-in fade-in">
                                     <p className="text-xs text-red-400 mb-2 font-bold flex items-center gap-2">
                                        <Lock className="w-3 h-3" />
                                        MASTER PRIVATE KEY
                                     </p>
                                     <p className="font-mono text-[10px] break-all select-all text-red-200/80">{user.privateKeyBase58}</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </Card>

                <Button variant="ghost" fullWidth onClick={onLogout} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
                    <LogOut className="w-4 h-4 mr-2" /> Disconnect Wallet
                </Button>
            </div>
        </div>
    );
};