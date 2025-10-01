import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Spinner from '@/components/common/Spinner';
import { motion } from 'framer-motion';

const ChartContainer = ({ title, description, children, loading, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className={className}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="h-[300px] w-full">
                            {children}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ChartContainer;