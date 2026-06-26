import React, { useState } from 'react';

/**
 * Componente ModalDesgloseStock
 * 
 * Un modal optimizado visualmente para la gestión de inventario de jabones.
 * Implementado con estilos en línea (Inline Styles) compatibles con la arquitectura actual
 * de la app, eliminando dependencias externas de CSS.
 * 
 * Muestra el Total General, Listo para usar y En Curado en la Sección Macro.
 * Muestra el detalle micro por Lote con su tipo (Estándar/Experimento), tooltip para notas
 * y estado individual (Listo/En Curado).
 */
const ModalDesgloseStock = ({ isOpen, onClose, jabonNombre = '', lotes = [], cantidadLista = 0 }) => {
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  if (!isOpen) return null;

  // Lógica macro: Cálculo de métricas operacionales
  const totalListo = cantidadLista;

  const totalCurando = lotes
    .filter((l) => l.enCurado)
    .reduce((sum, l) => sum + l.cantidad, 0);

  const totalGeneral = totalListo + totalCurando;

  return (
    <div style={styles.overlay}>
      {/* Contenedor del Modal */}
      <div style={styles.modalContainer} role="dialog" aria-modal="true">
        
        {/* Cabecera */}
        <div style={styles.header}>
          <div style={styles.titleContainer}>
            <h3 style={styles.title}>
              Desglose de Stock: <span style={{ color: '#007bff' }}>{jabonNombre}</span>
            </h3>
            {/* Botón de cierre "X" rápido en la esquina superior */}
            <button 
              onClick={onClose}
              style={styles.closeXButton}
              aria-label="Cerrar"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sección Macro: Métricas Rápidas en 3 Columnas */}
          <div style={styles.macroContainer}>
            <div style={styles.macroCol(true, '33.3%')}>
              <span style={styles.macroValue}>
                {totalGeneral} <span style={styles.macroUnit}>pzs</span>
              </span>
              <span style={styles.macroLabel}>
                Total General
              </span>
            </div>
            <div style={styles.macroCol(true, '33.3%')}>
              <span style={{ ...styles.macroValue, color: '#28a745' }}>
                🟢 {totalListo} <span style={styles.macroUnit}>pzs</span>
              </span>
              <span style={styles.macroLabel}>
                Listo para usar
              </span>
            </div>
            <div style={styles.macroCol(false, '33.3%')}>
              <span style={{ ...styles.macroValue, color: '#ffc107' }}>
                ⏳ {totalCurando} <span style={styles.macroUnit}>pzs</span>
              </span>
              <span style={styles.macroLabel}>
                En Curado
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal: Lista de Lotes (Micro) */}
        <div style={styles.body}>
          <p style={styles.sectionTitle}>
            Detalle por Lote ({lotes.length})
          </p>
          
          {lotes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lotes.map((lote) => {
                const isHovered = hoveredRowId === lote.id;
                return (
                  <div 
                    key={lote.id} 
                    style={{
                      ...styles.row,
                      backgroundColor: isHovered ? '#f9fafb' : 'transparent'
                    }}
                    onMouseEnter={() => setHoveredRowId(lote.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    
                    {/* Columna Izquierda: Lote + Badge de Tipo */}
                    <div style={styles.leftCol}>
                      <span style={styles.code}>
                        {lote.codigo}
                      </span>
                      
                      <span style={styles.badge(lote.tipo)}>
                        {lote.tipo === 'estandar' ? 'Estándar' : 'Experimento'}
                      </span>
                      
                      {/* Icono + Tooltip de Notas si es Experimento */}
                      {lote.tipo === 'experimento' && lote.nota && (
                        <div style={styles.tooltipContainer}>
                          <span 
                            style={styles.tooltipTrigger}
                            onMouseEnter={() => setActiveTooltipId(lote.id)}
                            onMouseLeave={() => setActiveTooltipId(null)}
                          >
                            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          
                          {activeTooltipId === lote.id && (
                            <>
                              <div style={styles.tooltipBox}>
                                {lote.nota}
                              </div>
                              <div style={styles.tooltipArrow} />
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Centro: Puntos guía */}
                    <div style={styles.line}></div>

                    {/* Columna Derecha: Cantidad + Emojis de Estado */}
                    <div style={styles.rightCol}>
                      <span style={styles.qty}>
                        {lote.cantidad} <span style={styles.qtyUnit}>pzs</span>
                        <span 
                          style={{ marginLeft: '6px' }} 
                          title={lote.enCurado ? "En proceso de curado" : "Listo para usar"}
                        >
                          {lote.enCurado ? '⏳' : '🟢'}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
              No hay lotes registrados para este jabón.
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{
              ...styles.closeButton,
              backgroundColor: isCloseHovered ? '#f3f4f6' : '#ffffff'
            }}
            onMouseEnter={() => setIsCloseHovered(true)}
            onMouseLeave={() => setIsCloseHovered(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos de diseño inline
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1200,
    backdropFilter: 'blur(4px)',
    fontFamily: 'sans-serif'
  },
  modalContainer: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '24px 24px 16px 24px',
    borderBottom: '1px solid #f3f4f6'
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: '-0.025em'
  },
  closeXButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, color 0.2s'
  },
  macroContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: '20px',
    padding: '12px 0',
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    borderRadius: '8px'
  },
  macroCol: (hasBorder, width = '50%') => ({
    textAlign: 'center',
    width: width,
    borderRight: hasBorder ? '1px solid rgba(229, 231, 235, 0.6)' : 'none'
  }),
  macroValue: {
    display: 'block',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1f2937'
  },
  macroUnit: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280'
  },
  macroLabel: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#9ca3af',
    marginTop: '2px'
  },
  body: {
    padding: '16px 24px',
    maxHeight: '260px',
    overflowY: 'auto'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    padding: '6px 8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
  },
  leftCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  code: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#374151',
    letterSpacing: '-0.025em'
  },
  badge: (tipo) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '600',
    borderRadius: '9999px',
    backgroundColor: tipo === 'estandar' ? '#ecfdf5' : '#e0e7ff',
    color: tipo === 'estandar' ? '#047857' : '#4338ca',
    border: `1px solid ${tipo === 'estandar' ? '#d1fae5' : '#c7d2fe'}`
  }),
  line: {
    flexGrow: 1,
    borderBottom: '1px dotted #e5e7eb',
    margin: '0 12px'
  },
  rightCol: {
    textAlign: 'right'
  },
  qty: {
    fontWeight: 'bold',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center'
  },
  qtyUnit: {
    fontSize: '11px',
    fontWeight: 'normal',
    color: '#9ca3af',
    marginLeft: '2px'
  },
  tooltipContainer: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center'
  },
  tooltipTrigger: {
    color: '#818cf8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px'
  },
  tooltipBox: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    width: '180px',
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: '11px',
    borderRadius: '8px',
    padding: '6px 10px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    lineHeight: '1.4',
    textAlign: 'center',
    zIndex: 1200
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    marginBottom: '4px',
    width: '8px',
    height: '8px',
    backgroundColor: '#111827',
    zIndex: 1199
  },
  footer: {
    padding: '16px 24px',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  closeButton: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'background-color 0.2s, box-shadow 0.2s'
  }
};

export default ModalDesgloseStock;
