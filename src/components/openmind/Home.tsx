import { Header } from './Header';
import { Heart, Users, Calendar, Star } from 'lucide-react';
import type { Page } from './types';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header onNavigate={onNavigate} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-700 dark:to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-pink-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="mb-6">
                Conectando você ao cuidado psicológico
                <span className="block">acessível</span>
              </h1>
              <p className="mb-8 text-pink-50 text-lg">
                Psicólogos estagiários dedicados oferecendo atendimento gratuito e de qualidade. 
                Encontre o apoio emocional que você precisa, quando você precisa.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-8 py-3 bg-white text-pink-600 rounded-full hover:bg-pink-50 transition-colors"
                >
                  Começar Agora
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  Já tenho conta
                </button>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl mb-1">500+</div>
                  <div className="text-pink-100">Sessões</div>
                </div>
                <div>
                  <div className="text-4xl mb-1">100+</div>
                  <div className="text-pink-100">Psicólogos</div>
                </div>
                <div>
                  <div className="text-4xl mb-1">1000+</div>
                  <div className="text-pink-100">Atendimentos</div>
                </div>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="relative">
                <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>Ansiedade</span>
                </div>
                <div className="absolute top-32 right-20 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                  <span>Autoestima</span>
                </div>
                <div className="absolute bottom-20 right-10 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                  <span>Depressão</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-4 text-gray-900 dark:text-white">
            Por que escolher o OpenMind?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Nossa plataforma oferece um ambiente seguro e profissional para seu bem-estar emocional
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-pink-50 dark:bg-pink-900/20 rounded-2xl border border-pink-100 dark:border-pink-800 transition-colors duration-300">
              <div className="w-12 h-12 bg-pink-600 dark:bg-pink-700 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="mb-3 text-gray-900 dark:text-white">Atendimento Gratuito</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Acesso a psicólogos estagiários qualificados sem custos, supervisionados por profissionais experientes
              </p>
            </div>
            
            <div className="p-8 bg-pink-50 dark:bg-pink-900/20 rounded-2xl border border-pink-100 dark:border-pink-800 transition-colors duration-300">
              <div className="w-12 h-12 bg-pink-600 dark:bg-pink-700 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="mb-3 text-gray-900 dark:text-white">Agendamento Flexível</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema de lembretes automáticos e horários adaptados à sua rotina universitária
              </p>
            </div>
            
            <div className="p-8 bg-pink-50 dark:bg-pink-900/20 rounded-2xl border border-pink-100 dark:border-pink-800 transition-colors duration-300">
              <div className="w-12 h-12 bg-pink-600 dark:bg-pink-700 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="mb-3 text-gray-900 dark:text-white">Avaliação Anônima</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Compartilhe sua experiência de forma anônima e ajude a melhorar nossos serviços
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-gray-900 dark:text-white">Pronto para começar?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Dê o primeiro passo em direção ao seu bem-estar emocional
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-3 bg-pink-600 dark:bg-pink-700 text-white rounded-full hover:bg-pink-700 dark:hover:bg-pink-800 transition-colors"
          >
            Cadastre-se Gratuitamente
          </button>
        </div>
      </section>
    </div>
  );
}
