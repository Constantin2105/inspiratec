import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = ({ children }) => {
    const { user, profile, signOut } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block border-r h-screen sticky top-0">
                <AdminSidebar user={user} profile={profile} signOut={signOut} />
            </aside>
            
            <div className="flex flex-col lg:h-screen">
                 <header className="flex h-16 items-center justify-between border-b bg-background px-6 sticky top-0 z-30 lg:hidden">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72">
                            <AdminSidebar 
                                user={user}
                                profile={profile} 
                                signOut={signOut} 
                                onLinkClick={() => setIsSidebarOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>
                 </header>
                <main className="flex-1 overflow-y-auto bg-muted/40 p-4 sm:p-6 lg:p-8">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;