<script lang="ts">
import ApiService from "@/services/ApiService";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default {
  name: "SergyView",
  data() {
    return {
      messages: [] as Message[],
      inputMessage: "",
      sessionId: "",
      loading: false,
      isSidebarCollapsed: false,
    };
  },
  mounted() {
    this.initializeChat();
    this.checkSidebarState();
    this.setupSidebarObserver();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkSidebarState);
  },
  methods: {
    generateSessionId(): string {
      // Generar un hash único para la sesión
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 15);
      return `${timestamp}-${random}`;
    },
    initializeChat() {
      // Generar sessionId al entrar
      this.sessionId = this.generateSessionId();

      // Añadir mensaje inicial del asistente
      this.messages.push({
        id: `msg-${Date.now()}`,
        type: "assistant",
        content: `Hola soy Sergy!
Estoy aquí para ayudarte con tus consultas sobre el Admin de Viu el Pàdel, pregúntame lo que quieras`,
        timestamp: new Date(),
      });
    },
    async sendMessage() {
      if (!this.inputMessage.trim() || this.loading) {
        return;
      }

      const userMessage = this.inputMessage.trim();
      this.inputMessage = "";

      // Añadir mensaje del usuario
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        type: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      this.messages.push(userMsg);

      // Enviar al backend
      this.loading = true;
      try {
        const response = await ApiService.sendAgentMessage(
          userMessage,
          this.sessionId
        );

        // Añadir respuesta del asistente
        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          type: "assistant",
          content: response.response,
          timestamp: new Date(),
        };
        this.messages.push(assistantMsg);
      } catch (err) {
        // Añadir mensaje de error
        const errorMsg: Message = {
          id: `msg-${Date.now()}`,
          type: "assistant",
          content:
            "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo.",
          timestamp: new Date(),
        };
        this.messages.push(errorMsg);
        console.error("Error sending message:", err);
      } finally {
        this.loading = false;
        // Scroll al final después de un pequeño delay para que se renderice el mensaje
        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        });
      }
    },
    scrollToBottom() {
      const chatContainer = this.$refs.chatContainer as HTMLElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    },
    handleKeyPress(event: KeyboardEvent) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    },
    adjustTextareaHeight(event: Event) {
      const textarea = event.target as HTMLTextAreaElement;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    },
    checkSidebarState() {
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        this.isSidebarCollapsed =
          mainContent.classList.contains("sidebar-collapsed");
      } else {
        // Fallback: detectar por ancho de viewport
        this.isSidebarCollapsed = window.innerWidth <= 768;
      }
    },
    setupSidebarObserver() {
      // Observar cambios en el main-content para detectar cuando el sidebar se colapsa
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        const observer = new MutationObserver(() => {
          this.checkSidebarState();
        });
        observer.observe(mainContent, {
          attributes: true,
          attributeFilter: ["class"],
        });
      }
      // También observar cambios de tamaño de ventana
      window.addEventListener("resize", this.checkSidebarState);
    },
  },
  watch: {
    messages: {
      handler() {
        // Scroll al final cuando se añaden nuevos mensajes
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true,
    },
  },
};
</script>

<template>
  <div class="sergy-view">
    <div class="chat-container" ref="chatContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="message.type"
      >
        <div v-if="message.type === 'assistant'" class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>
          <div class="message-time">
            {{
              message.timestamp.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </div>
        </div>
      </div>
      <div v-if="loading" class="message assistant">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-text typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="chat-input-container"
      :style="{ left: isSidebarCollapsed ? '60px' : '200px' }"
    >
      <div class="chat-input-wrapper">
        <textarea
          v-model="inputMessage"
          @keydown="handleKeyPress"
          @input="adjustTextareaHeight"
          class="chat-input"
          placeholder="Escribe tu mensaje aquí..."
          :disabled="loading"
          rows="1"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || loading"
          class="send-button"
        >
          <span v-if="loading">⏳</span>
          <span v-else>📤</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sergy-view {
  width: 100%;
  max-width: 100%;
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  font-family: "Signika", sans-serif;
  box-sizing: border-box;
  background-color: #f9f9f9;
  position: relative;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 80%;
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.assistant {
  align-self: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 50%;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message.user .message-content {
  align-items: flex-end;
}

.message.assistant .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message.user .message-text {
  background-color: #cddc39;
  color: #292929;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-text {
  background-color: #fff;
  color: #292929;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.75rem;
  color: #999999;
  padding: 0 0.5rem;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  padding: 0.875rem 1.25rem;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #cddc39;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input-container {
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 1.5rem 2rem;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: left 0.3s ease;
}

@media (max-width: 768px) {
  .chat-input-container {
    left: 60px !important;
  }
}

.chat-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  max-width: 100%;
}

.chat-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: "Signika", sans-serif;
  color: #292929;
  background-color: #fff;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.chat-input:focus {
  outline: none;
  border-color: #cddc39;
  box-shadow: 0 0 0 3px rgba(205, 220, 57, 0.1);
}

.chat-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.chat-input::placeholder {
  color: #999;
}

.send-button {
  padding: 0.875rem 1.25rem;
  background-color: #cddc39;
  color: #292929;
  border: none;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background-color: #b8c837;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(205, 220, 57, 0.3);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .chat-container {
    padding: 1.5rem 1rem;
    padding-bottom: 120px;
  }

  .message {
    max-width: 90%;
  }

  .chat-input-container {
    padding: 1rem;
    left: 60px;
  }
}
</style>
