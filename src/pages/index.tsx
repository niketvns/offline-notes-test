import { AppContextProvider } from "@/store/appContext";
import NoteList from "../components/NoteList";

interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

declare global {
  interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
  }

  interface SyncEvent extends ExtendableEvent {
    readonly lastChance: boolean;
    readonly tag: string;
  }

  interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
  }
}

export default function Home() {
  return (
    <AppContextProvider>
      <div>
        <NoteList />
      </div>
    </AppContextProvider>
  );
}
