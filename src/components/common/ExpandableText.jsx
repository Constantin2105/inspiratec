import React, { useState, useRef, useLayoutEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { ChevronDown, ChevronUp } from 'lucide-react';
    
    const ExpandableText = ({ text, maxLines = 6 }) => {
      const [isExpanded, setIsExpanded] = useState(false);
      const [canTruncate, setCanTruncate] = useState(false);
      const textRef = useRef(null);
    
      useLayoutEffect(() => {
        if (textRef.current) {
          const isOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight;
          setCanTruncate(isOverflowing);
        }
      }, [text, maxLines]);
    
      const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
      };
    
      const lineClampStyle = {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: maxLines,
        overflow: 'hidden',
      };
    
      return (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          <p
            ref={textRef}
            style={!isExpanded ? lineClampStyle : undefined}
          >
            {text}
          </p>
          {canTruncate && (
            <Button
              variant="link"
              className="p-0 h-auto text-primary mt-2 flex items-center"
              onClick={toggleExpanded}
            >
              {isExpanded ? 'Voir moins' : 'Voir plus'}
              {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          )}
        </div>
      );
    };
    
    export default ExpandableText;