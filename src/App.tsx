
import { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { TokenSource } from 'livekit-client';

import '@livekit/components-styles';
import './App.css';

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
      <main className="join-page">
        <form
          className="join-card"
          onSubmit={(event) => {
            event.preventDefault();
            void joinRoom();
          }}
        >
          <div className="brand">
            <h1>Disclike</h1>
            <span>Real-Time Communication</span>
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              value={participantName}
              onChange={(event) =>
                setParticipantName(event.target.value)
              }
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div className="form-group">
            <label>Room Name</label>
            <input
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Masukkan nama room"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Connecting...' : 'Join Meeting'}
          </button>

          <p className="helper-text">
            Gunakan nama room yang sama untuk bertemu dengan peserta lain.
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="meeting-page">
      <LiveKitRoom
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
