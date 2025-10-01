import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Star, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const StarRating = ({ rating }) => {
    if (!rating) return null;
    return (
      <div className="flex items-center text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    );
};

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.charAt(0).toUpperCase();
};

const TestimonialKanbanCard = ({ testimonial, onSelect, onStatusChange }) => {
  const { id, display_name, avatar_url, content, rating, created_at, status } = testimonial;

  return (
    <Card 
      className="mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onSelect(testimonial)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar_url} alt={display_name} />
            <AvatarFallback>{getInitials(display_name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-sm font-medium">{display_name || 'Anonyme'}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {status !== 'approved' && <DropdownMenuItem onClick={() => onStatusChange(id, 'approved')}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/>Approuver</DropdownMenuItem>}
            {status !== 'rejected' && <DropdownMenuItem onClick={() => onStatusChange(id, 'rejected')}><XCircle className="mr-2 h-4 w-4 text-red-500"/>Rejeter</DropdownMenuItem>}
            {status !== 'pending' && <DropdownMenuItem onClick={() => onStatusChange(id, 'pending')}><Clock className="mr-2 h-4 w-4 text-yellow-500"/>Mettre en attente</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{content}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <StarRating rating={rating} />
          <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr })}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialKanbanCard;