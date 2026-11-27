import { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { TokenSource } from 'livekit-client';

import '@livekit/components-styles';

const tokenSource = TokenSource.developmentTokenServer(
  import.meta.env.VITE_LIVEKIT_TOKEN_SERVER_ID,
);

function App() {
  const [roomName, setRoomName] = useState('disclike-room');
  const [participantName, setParticipantName] = useState('');
  const [connection, setConnection] = useState<{
    serverUrl: string;
    token: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const joinRoom = async () => {
    if (!roomName.trim() || !participantName.trim()) {
      setError('Nama dan room wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await tokenSource.fetch({
        roomName: roomName.trim(),
        participantName: participantName.trim(),
        participantIdentity: crypto.randomUUID(),
      });

      setConnection({
        serverUrl: result.serverUrl,
        token: result.participantToken,
      });
    } catch (err) {
      console.error(err);
      setError('Gagal terhubung. Periksa konfigurasi LiveKit.');
    } finally {
      setLoading(false);
    }
  };

  if (!connection) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <form
          className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl backdrop-blur"
          onSubmit={(event) => {
            event.preventDefault();
            void joinRoom();
          }}
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Disclike
            </h1>
            <span className="text-sm text-slate-400">
              Real-Time Communication
            </span>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-slate-300"
            >
              Display Name
            </label>
            <input
              id="displayName"
              value={participantName}
              onChange={(event) => setParticipantName(event.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="roomName"
              className="block text-sm font-medium text-slate-300"
            >
              Room Name
            </label>
            <input
              id="roomName"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Masukkan nama room"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Connecting...' : 'Join Meeting'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Gunakan nama room yang sama untuk bertemu dengan peserta lain.
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen bg-slate-950">
      <LiveKitRoom
        data-lk-theme="default"
        className="h-full"
        serverUrl={connection.serverUrl}
        token={connection.token}
        connect={true}
        audio={true}
        video={true}
        onDisconnected={() => setConnection(null)}
        onError={(err) => console.error('LiveKit error:', err)}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </main>
  );
}

export default App;