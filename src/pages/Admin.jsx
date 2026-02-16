import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { processCSVData } from '../utils/csvProcessor';
import Header from '../components/Header';

const Admin = () => {
    const { saveReportData, salesData, clearData, logout, activeUnit } = useData();
    const navigate = useNavigate();
    const [msg, setMsg] = useState('');

    const handleDataParsed = (rawData) => {
        const processed = processCSVData(rawData);
        saveReportData(processed);
        setMsg('Dados carregados com sucesso! Redirecionando...');
        setTimeout(() => navigate('/report'), 1500);
    };

    const handleDownloadBackup = () => {
        if (!salesData || salesData.length === 0) {
            alert("Não há dados para salvar.");
            return;
        }
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(salesData)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `backup_${activeUnit}_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    };

    const handleRestoreBackup = (e) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = (event) => {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    if (Array.isArray(parsedData)) {
                        saveReportData(parsedData);
                        setMsg("Backup restaurado com sucesso!");
                        setTimeout(() => setMsg(''), 3000);
                    } else {
                        alert("Arquivo de backup inválido.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("Erro ao ler o arquivo de backup.");
                }
            };
        }
    };

    return (
        <div style={{ fontFamily: 'var(--font-main)', minHeight: '100vh', background: '#f5f5f5' }}>
            <div style={{ background: '#333', color: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 'bold' }}>Painel Administrativo GMAD - {activeUnit === 'madville' ? 'Madville' : 'Curitiba'}</div>
                <button onClick={logout} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>Sair</button>
            </div>

            <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', color: '#2C3E50' }}>Gestão de Dados</h2>

                    <div style={{ margin: '20px 0' }}>
                        <p><strong>Status Atual:</strong> {salesData.length > 0 ? `${salesData.length} registros carregados.` : 'Nenhum dado carregado.'}</p>

                        {salesData.length > 0 && (
                            <button onClick={clearData} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                                Apagar Base de Dados
                            </button>
                        )}
                    </div>

                    {/* Backup Section */}
                    <div style={{ marginTop: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Backup & Restauração</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleDownloadBackup}
                                style={{
                                    padding: '8px 15px',
                                    background: '#8e44ad',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                💾 Baixar Backup Atual (.json)
                            </button>

                            <label style={{
                                padding: '8px 15px',
                                background: '#f39c12',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                display: 'inline-block'
                            }}>
                                📂 Restaurar Backup
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleRestoreBackup}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>

                    <h3 style={{ marginTop: '40px', color: '#555' }}>Carga de Novos Dados</h3>
                    <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px' }}>
                        Faça o upload do CSV mensal aqui. Isso substituirá os dados atuais e atualizará o relatório para todos os usuários.
                    </p>

                    <div style={{ border: '2px dashed #ddd', padding: '20px', borderRadius: '8px' }}>
                        <FileUpload onDataParsed={handleDataParsed} />
                        {msg && <p style={{ color: '#27ae60', fontWeight: 'bold', marginTop: '10px' }}>{msg}</p>}
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Ver Relatório Atual &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
