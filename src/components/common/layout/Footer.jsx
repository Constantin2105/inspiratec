import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card text-muted-foreground border-t">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img alt="InspiraTec Logo Light" className="h-8 w-auto dark:hidden" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/17d000be4da23355c5ab09906ba1234e.png" />
              <img alt="InspiraTec Logo Dark" className="h-8 w-auto hidden dark:block" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/49b203ed-7069-4103-a7af-8f66310d10ce/b1b2bc2e4cf4f923ca642fa0f070385e.png" />
            </Link>
            <p className="text-sm">Votre passerelle vers les meilleurs talents tech.</p>
          </div>
          <div>
            <p className="font-semibold text-card-foreground mb-4">Navigation</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/post-mission" className="hover:text-primary transition-colors">On a une mission</Link></li>
              <li><Link to="/find-mission" className="hover:text-primary transition-colors">Trouver une mission</Link></li>
              <li><Link to="/why-inspiratec" className="hover:text-primary transition-colors">Pourquoi Inspiratec ?</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-card-foreground mb-4">Légal</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/legal-mentions" className="hover:text-primary transition-colors">Mentions Légales</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/rgpd" className="hover:text-primary transition-colors">RGPD</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-card-foreground mb-4">Suivez-nous</p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors"><Twitter /></a>
              <a href="https://www.linkedin.com/company/inspiratec/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-primary transition-colors"><Linkedin /></a>
              <a href="#" aria-label="GitHub" className="hover:text-primary transition-colors"><Github /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm">
          <p>&copy; {new Date().getFullYear()} InspiraTec – Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;