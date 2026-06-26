export const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#333'
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#111'
    },
    filterBar: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '15px',
        padding: '18px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #eef2f6',
        marginBottom: '25px'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#666'
    },
    input: {
        padding: '8px 12px',
        fontSize: '14px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        outline: 'none',
        boxSizing: 'border-box',
        backgroundColor: 'white'
    },
    clearBtn: {
        alignSelf: 'flex-end',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#dc3545',
        backgroundColor: 'transparent',
        border: '1px solid #dc3545',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: '16px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #eef2f6'
    },
    th: {
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #eef2f6',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'left'
    },
    td: {
        padding: '14px 16px',
        borderBottom: '1px solid #eef2f6',
        fontSize: '14px',
        color: '#555'
    },
    badge: (tipo) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: 'bold',
        borderRadius: '9999px',
        backgroundColor: tipo === 'ESTANDAR' ? '#e6f4ea' : '#eef2ff',
        color: tipo === 'ESTANDAR' ? '#137333' : '#3f51b5',
        border: `1px solid ${tipo === 'ESTANDAR' ? '#ceead6' : '#c5cae9'}`
    }),
    badgeSalida: (motivo) => {
        let bgColor = '#e8f0fe';
        let color = '#1a73e8';
        let borderColor = '#d2e3fc';
        if (motivo === 'VENTA') {
            bgColor = '#e6f4ea';
            color = '#137333';
            borderColor = '#ceead6';
        } else if (motivo === 'REGALO') {
            bgColor = '#fef7e0';
            color = '#b06000';
            borderColor = '#feebc8';
        } else if (motivo === 'USO') {
            bgColor = '#e8f0fe';
            color = '#1a73e8';
            borderColor = '#d2e3fc';
        } else if (motivo === 'MERMA') {
            bgColor = '#fce8e6';
            color = '#c5221f';
            borderColor = '#fad2cf';
        }
        return {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 'bold',
            borderRadius: '9999px',
            backgroundColor: bgColor,
            color: color,
            border: `1px solid ${borderColor}`
        };
    },
    notesContainer: {
        maxWidth: '300px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
};
