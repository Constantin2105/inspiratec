import React from 'react';
import TestimonialList from '@/components/admin/testimonials/TestimonialList';

const AdminTestimonials = ({ onSelect, refreshKey, onAction }) => {
  return (
    <div>
      <TestimonialList onSelect={onSelect} refreshKey={refreshKey} onAction={onAction} />
    </div>
  );
};

export default AdminTestimonials;