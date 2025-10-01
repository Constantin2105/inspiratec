import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';

const Rating = () => (
	<div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-10 justify-center lg:justify-start'>
		<div className='flex items-center gap-0.5'>
			{[...Array(5)].map((_, i) => (
				<Star
					key={i}
					className={`h-5 w-5 ${
						i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400 fill-yellow-200'
					}`}
				/>
			))}
		</div>
		<p className='text-sm text-muted-foreground text-center'>
			<span className='font-bold text-foreground'>4.9/5</span> basé sur +100
			avis clients.
		</p>
	</div>
);

const HeroSection = ({ handleRedirect }) => {
	return (
		<section className='bg-background overflow-hidden'>
			<div className='container-custom pt-20 pb-16 md:pt-32 md:pb-28'>
				<div className='grid lg:grid-cols-2 gap-x-16 items-center'>
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.7, ease: 'easeOut' }}
						className='text-center lg:text-left z-10'
					>
						<h1 className='font-futura text-[2.5rem] leading-tight md:text-6xl font-bold tracking-tighter text-foreground mb-4 max-w-2xl mx-auto lg:mx-0'>
							Trouvez le <span className='text-primary'>Profil Tech Idéal</span> pour
							votre Mission
						</h1>
						<p className='max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-muted-foreground mb-8'>
							Propulsez vos ambitions technologiques grâce à notre plateforme
							freelance. Nous vous connectons instantanément à des experts tech
							rigoureusement sélectionnés. Que votre recherche d'expert concerne
							un data scientist, un expert en cybersécurité ou un chef de
							projet Agile, trouvez le profil idéal en quelques clics.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start max-w-sm mx-auto sm:max-w-none'>
							<Button
								className='w-full sm:w-auto text-base px-6 py-5 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-auto'
								onClick={() => handleRedirect('/signup/company')}
							>
								Besoin d’un Expert Tech ?
								<ArrowRight className='ml-2 h-5 w-5' />
							</Button>
							<Button
								variant='secondary'
								className='w-full sm:w-auto text-base px-6 py-5 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-auto'
								onClick={() => handleRedirect('/signup/expert')}
							>
								Trouver ma future mission
							</Button>
						</div>
						<Rating />
					</motion.div>

					<div className='relative hidden lg:block'>
						<img
							alt="Équipe d'experts tech diversifiée en réunion, collaborant sur un projet innovant"
							className='rounded-2xl shadow-2xl w-full h-full object-cover'
							src='https://horizons-cdn.hostinger.com/49b203ed-7069-4103-a7af-8f66310d10ce/faa621642c8ddb96abda0c358330c208.jpg'
						/>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
						className='lg:hidden mt-12'
					>
						<img
							alt='Illustration de collaboration tech pour la version mobile'
							className='rounded-2xl shadow-xl w-full max-w-md mx-auto h-auto object-cover'
							src='https://horizons-cdn.hostinger.com/49b203ed-7069-4103-a7af-8f66310d10ce/faa621642c8ddb96abda0c358330c208.jpg'
						/>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;