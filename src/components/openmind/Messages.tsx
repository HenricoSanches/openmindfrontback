import { useEffect, useRef, useState } from "react";
import { Header } from "./Header";
import { Send, User, MessageCircle, Plus, X } from "lucide-react";
import type { UserType, Page } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  userType: UserType;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Conversation {
  id: string;
  patient_id: string;
  psychologist_id: string;
  updated_at: string;
  other?: {
    id: string;
    full_name: string;
    specialty: string | null;
  } | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Contact {
  id: string;
  full_name: string;
  specialty: string | null;
}

export function Messages({
  userType,
  onNavigate,
  onLogout,
}: Props) {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // =========================
  // LOAD CONVERSATIONS
  // =========================
  const loadConversations = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `patient_id.eq.${user.id},psychologist_id.eq.${user.id}`
      )
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const list = (data ?? []) as Conversation[];

    const otherIds = list.map((c) =>
      c.patient_id === user.id
        ? c.psychologist_id
        : c.patient_id
    );

    if (otherIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, specialty")
        .in("id", otherIds);

      const map = new Map(
        (profiles ?? []).map((p: any) => [p.id, p])
      );

      list.forEach((c) => {
        const oid =
          c.patient_id === user.id
            ? c.psychologist_id
            : c.patient_id;

        c.other = map.get(oid);
      });
    }

    setConversations(list);
    setLoading(false);
  };

  // =========================
  // LOAD CONTACTS
  // =========================
  const loadContacts = async () => {
    if (userType === "patient") {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, specialty")
        .eq("role", "psychologist")
        .eq("approved", true);

      if (error) {
        toast.error(error.message);
        return;
      }

      setContacts((data ?? []) as Contact[]);
    } else if (userType === "psychologist") {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, specialty")
        .eq("role", "patient");

      if (error) {
        toast.error(error.message);
        return;
      }

      setContacts((data ?? []) as Contact[]);
    }
  };

  // =========================
  // LOAD MESSAGES
  // =========================
  const loadMessages = async (conv: Conversation) => {
    setActive(conv);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(error.message);
      return;
    }

    setMessages((data ?? []) as Message[]);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
      });
    }, 50);
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const send = async () => {
    if (!active || !content.trim() || !user) return;

    const text = content.trim();

    setContent("");

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: active.id,
        sender_id: user.id,
        content: text,
      });

    if (error) {
      toast.error(error.message);
      setContent(text);
      return;
    }

    await supabase
      .from("conversations")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", active.id);
  };

  // =========================
  // START CONVERSATION
  // =========================
  const startConversation = async (
    contact: Contact
  ) => {
    if (!user) return;

    const patient_id =
      userType === "patient"
        ? user.id
        : contact.id;

    const psychologist_id =
      userType === "patient"
        ? contact.id
        : user.id;

    const existing = conversations.find(
      (c) =>
        c.patient_id === patient_id &&
        c.psychologist_id === psychologist_id
    );

    if (existing) {
      setShowNew(false);
      loadMessages(existing);
      return;
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        patient_id,
        psychologist_id,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setShowNew(false);

    await loadConversations();

    loadMessages(data as Conversation);
  };

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  useEffect(() => {
    if (!active) return;

    const channel = supabase
      .channel(`messages:${active.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${active.id}`,
        },
        (payload) => {
          setMessages((prev) => [
            ...prev,
            payload.new as Message,
          ]);

          setTimeout(() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
            });
          }, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [active?.id]);

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        onNavigate={onNavigate}
        showAuthButtons={false}
        onLogout={onLogout}
        userType={userType}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 dark:text-white">
              Mensagens
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Converse com{" "}
              {userType === "patient"
                ? "seu psicólogo"
                : "seus pacientes"}
            </p>
          </div>

          <button
            onClick={() => {
              loadContacts();
              setShowNew(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
          >
            <Plus className="w-4 h-4" />
            Nova conversa
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 h-[70vh]">
          {/* SIDEBAR */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-y-auto">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">
                Carregando...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">
                Nenhuma conversa ainda.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadMessages(c)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    active?.id === c.id
                      ? "bg-pink-50 dark:bg-pink-900/20"
                      : ""
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {c.other?.full_name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {c.other?.specialty}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* CHAT */}
          <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-xl border flex flex-col">
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Selecione uma conversa</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {active.other?.full_name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {active.other?.specialty}
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-2"
                >
                  {messages.map((m) => {
                    const mine =
                      m.sender_id === user?.id;

                    return (
                      <div
                        key={m.id}
                        className={`flex ${
                          mine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                            mine
                              ? "bg-pink-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t flex gap-2">
                  <input
                    value={content}
                    onChange={(e) =>
                      setContent(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        send();
                    }}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                  />

                  <button
                    onClick={send}
                    className="p-2 rounded-lg bg-pink-600 text-white"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showNew && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowNew(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-gray-900 dark:text-white">
                Iniciar conversa
              </h3>

              <button
                onClick={() => setShowNew(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              {contacts.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  Nenhum psicólogo disponível.
                </div>
              ) : (
                contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      startConversation(c)
                    }
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {c.full_name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {c.specialty}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}