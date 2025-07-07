// src/pages/Perfil.jsx
import React from 'react';

export default function Acerca() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Mi Perfil</h1>
      <p>Aquí puedes ver y editar tu información personal.</p>
    </main>
  );
}
// src/pages/Encargo.jsx
import { CloudUpload } from 'lucide-react';
import usePersonalizedOrder from '../hooks/usePersonalizedOrder';
import Modal from '../components/ui/Modal';

export default function Encargo() {
  const {
    preview,
    modelType,
    description,
    loading,
    success,
    error,
    setModelType,
    setDescription,
    handleImageChange,
    submit
  } = usePersonalizedOrder();

  return (
    // 1. Contenedor full-screen con fondo degradado
    <div className="
      min-h-screen p-6
      bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100
      flex justify-center items-start
    ">
      {/* 2. Tarjeta blanca translúcida con sombra */}
      <div className="
        w-full max-w-5xl
        bg-white/70 rounded-2xl shadow-xl p-8
        grid grid-cols-1 md:grid-cols-2 gap-8
      ">
        {/* 3. Zona de subida con borde punteado */}
        <div className="
          border-2 border-dashed border-gray-400
          rounded-xl h-80 flex items-center justify-center
        ">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-64 h-64 object-cover rounded-lg"
              />
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 p-1 rounded-full shadow">
                <img src={preview} alt="thumb" className="w-16 h-16 object-cover rounded-md" />
              </div>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="
                w-full h-full flex flex-col items-center justify-center
                text-gray-500 hover:text-gray-700 cursor-pointer
              "
            >
              <CloudUpload size={48} />
              <span className="mt-2 text-sm">Haz click para subir</span>
            </label>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* 4. Panel de selección y texto */}
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={modelType}
              onChange={e => setModelType(e.target.value)}
              className="
                w-full border border-gray-300 rounded-lg p-2
                focus:outline-none focus:ring-2 focus:ring-purple-300
              "
            >
              <option value="">Selecciona...</option>
              <option value="llavero">Llavero</option>
              <option value="cuadro_chico">Cuadro chico</option>
              <option value="cuadro_grande">Cuadro grande</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              className="
                w-full border border-gray-300 rounded-lg p-3
                focus:outline-none focus:ring-2 focus:ring-purple-300
                resize-none
              "
              placeholder="Escribe detalles adicionales..."
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={submit}
            disabled={loading || !preview || !modelType}
            className="
              mt-auto bg-green-500 text-white font-medium py-2 rounded-lg
              hover:bg-green-600 shadow-md disabled:opacity-50
            "
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>

      {/* 5. Modal de éxito */}
      {success && (
        <Modal onClose={() => window.location.reload()}>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Tu pedido ha sido enviado</h2>
            <p className="mb-6">Te caerá una notificación de tu cotización.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Aceptar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}