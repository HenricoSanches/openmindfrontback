import { Header } from './Header';
import { Calendar, MessageCircle, Star, User, Clock, Award, Settings, FileText, Bot } from 'lucide-react';
import type { UserType, Page } from './types';

interface DashboardProps {
  userType: UserType;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Psychologist {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  rating: number;
  sessions: number;
}

const psychologists: Psychologist[] = [
  {
    id: 1,
    name: 'Felipe Fonsoni de Lima',
    specialty: 'Ansiedade e Depressão',
    availability: 'Disponível',
    rating: 4.8,
    sessions: 45
  },
  {
    id: 2,
    name: 'Teste Psicologicaᵃ',
    specialty: 'Terapia Cognitiva',
    availability: 'Disponível',
    rating: 4.9,
    sessions: 52
  },
  {
    id: 3,
    name: 'Psicóloga',
    specialty: 'Relacionamentos',
    availability: 'Disponível',
    rating: 4.7,
    sessions: 38
  },
  {
    id: 4,
    name: 'Maria Eduardo',
    specialty: 'Autoestima',
    availability: 'Ocupado',
    rating: 4.6,
    sessions: 41
  },
  {
    id: 5,
    name: 'Dr. João Silva',
    specialty: 'Estresse Acadêmico',
    availability: 'Disponível',
    rating: 4.9,
    sessions: 67
  }
];

export function Dashboard({ userType, onNavigate, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header onNavigate={onNavigate} showAuthButtons={false} onLogout={onLogout} userType={userType} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-700 dark:to-pink-800 rounded-2xl p-8 text-white mb-8">
          <h1 className="mb-2">
            {userType === 'patient' ? 'Encontre Apoio Psicológico Gratuito' : 'Painel do Psicólogo'}
          </h1>
          <p className="text-pink-50">
            {userType === 'patient' 
              ? 'Conectamos você com psicólogos estagiários dedicados que oferecem atendimento gratuito e de qualidade'
              : 'Gerencie seus atendimentos e ajude estudantes universitários'
            }
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => onNavigate('appointments')}
            className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800 text-left group"
          >
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
              <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-500" />
            </div>
            <h3 className="mb-2 text-gray-900 dark:text-white">Agendamentos</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {userType === 'patient' ? 'Agende sua próxima sessão' : 'Veja seus horários'}
            </p>
          </button>
          
          <button
            onClick={() => onNavigate('evaluation')}
            className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800 text-left group"
          >
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
              <Star className="w-6 h-6 text-pink-600 dark:text-pink-500" />
            </div>
            <h3 className="mb-2 text-gray-900 dark:text-white">Avaliações</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {userType === 'patient' ? 'Avalie anonimamente' : 'Veja seu feedback'}
            </p>
          </button>
          
          <button
            onClick={() => onNavigate('messages')}
            className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800 text-left group"
          >
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
              <MessageCircle className="w-6 h-6 text-pink-600 dark:text-pink-500" />
            </div>
            <h3 className="mb-2 text-gray-900 dark:text-white">Mensagens</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {userType === 'patient' ? 'Converse com seu psicólogo' : 'Responda seus pacientes'}
            </p>
          </button>

          <button
            onClick={() => onNavigate('medical-records')}
            className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800 text-left group"
          >
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
              <FileText className="w-6 h-6 text-pink-600 dark:text-pink-500" />
            </div>
            <h3 className="mb-2 text-gray-900 dark:text-white">Prontuário</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {userType === 'patient' ? 'Veja seu histórico de sessões' : 'Anotações dos atendimentos'}
            </p>
          </button>

          {userType === 'patient' && (
            <button
              onClick={() => onNavigate('chatbot')}
              className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800 text-left group"
            >
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
                <Bot className="w-6 h-6 text-pink-600 dark:text-pink-500" />
              </div>
              <h3 className="mb-2 text-gray-900 dark:text-white">Assistente IA</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Apoio inicial 24h por IA
              </p>
            </button>
          )}
        </div>
        
        {/* Filter Section */}
        {userType === 'patient' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-gray-900 dark:text-white">Psicólogos Disponíveis</h2>
              <select className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>Todas as especialidades</option>
                <option>Ansiedade e Depressão</option>
                <option>Terapia Cognitiva</option>
                <option>Relacionamentos</option>
                <option>Autoestima</option>
                <option>Estresse Acadêmico</option>
              </select>
            </div>
            
            {/* Psychologists Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {psychologists.map((psychologist) => (
                <div 
                  key={psychologist.id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1 text-gray-900 dark:text-white truncate">
                          {psychologist.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {psychologist.specialty}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={`${
                          psychologist.availability === 'Disponível' 
                            ? 'text-green-600 dark:text-green-500' 
                            : 'text-orange-600 dark:text-orange-500'
                        }`}>
                          {psychologist.availability}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {psychologist.rating} • {psychologist.sessions} sessões
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onNavigate('schedule')}
                      className="w-full py-2 bg-pink-600 dark:bg-pink-700 text-white rounded-lg hover:bg-pink-700 dark:hover:bg-pink-800 transition-colors"
                    >
                      Ver Agenda
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Psychologist Stats */}
        {userType === 'psychologist' && (
          <>
            {/* Manage Schedule Button */}
            <div className="mb-6">
              <button
                onClick={() => onNavigate('manage-schedule')}
                className="w-full p-6 bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-700 dark:to-pink-800 text-white rounded-xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="mb-1">Gerenciar Horários Disponíveis</h3>
                      <p className="text-pink-100 text-sm">
                        Configure sua agenda e disponibilidade para atendimentos
                      </p>
                    </div>
                  </div>
                  <Calendar className="w-8 h-8 opacity-50" />
                </div>
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Sessões Hoje</span>
                  <Calendar className="w-5 h-5 text-pink-600 dark:text-pink-500" />
                </div>
                <div className="text-3xl text-gray-900 dark:text-white">3</div>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Total Pacientes</span>
                  <User className="w-5 h-5 text-pink-600 dark:text-pink-500" />
                </div>
                <div className="text-3xl text-gray-900 dark:text-white">12</div>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Avaliação</span>
                  <Star className="w-5 h-5 text-pink-600 dark:text-pink-500" />
                </div>
                <div className="text-3xl text-gray-900 dark:text-white">4.8</div>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Horas Totais</span>
                  <Award className="w-5 h-5 text-pink-600 dark:text-pink-500" />
                </div>
                <div className="text-3xl text-gray-900 dark:text-white">45</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}