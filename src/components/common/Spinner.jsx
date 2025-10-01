import React from 'react';
    import { motion } from 'framer-motion';
    import { Loader2 } from 'lucide-react';

    const Spinner = ({ size = 'md', color = 'text-primary' }) => {
      const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-20 w-20',
      };

      return (
        <div className={`flex justify-center items-center ${sizeClasses[size]}`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className={`${sizeClasses[size]} ${color}`} />
          </motion.div>
        </div>
      );
    };

    export default Spinner;