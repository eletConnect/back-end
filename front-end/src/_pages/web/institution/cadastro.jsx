import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from "@supabase/supabase-js";
import Header from "../../../_components/Header";
import showToast from "../../../_utils/toasts";
import "./instituicao.css";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

export default function Instituicao() {
    const [cnpj, setCnpj] = useState('');
    const [nome, setNome] = useState('');
    const [cep, setCEP] = useState('');
    const [endereco, setEndereco] = useState('');
    const [telefone, setTelefone] = useState('');
    const [logo, setLogo] = useState(null);
    const [codigo, setCodigo] = useState('');
    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        if (!user || !user.id) {
            window.location.href = '/login';
        } else {
            document.querySelector('button[data-bs-target="#cadastrarEscola"]').click();
        }
    }, []);

    const verificarCNPJ = async (cnpj) => {
        try {
            const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { withCredentials: false });
            if (response.status === 200) {
                setCnpj(response.data.cnpj);
            }
        } catch (error) {
            console.error('Erro ao verificar CNPJ', error);
            showToast('danger', 'Erro ao verificar o CNPJ.');
        }
    };

    const verificarCEP = async (cep) => {
        try {
            const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`, { withCredentials: false });
            if (response.status === 200) {
                setEndereco(response.data.street);
            }
        } catch (error) {
            console.error('Erro ao verificar CEP', error);
            showToast('danger', 'Erro ao verificar CEP.');
        }
    };

    const armazenarLogo = async (logo, nome) => {
        const path = `LOGOTIPO_${nome}_${Date.now()}`;
        try {
            const { error } = await supabase.storage.from('logotipo').upload(path, logo);
            if (error) throw new Error(error.message);
            return path;
        } catch (error) {
            throw error;
        }
    };

    const cadastrarInstituicao = async (e) => {
        e.preventDefault();

        if (!cnpj || !nome || !cep || !endereco || !telefone || !logo) {
            showFeedback('inputCNPJ', 'feedback1', 'Preencha o CNPJ corretamente.');
            showFeedback('inputNome', 'feedback2', 'Preencha o nome corretamente.');
            showFeedback('inputCEP', 'feedback3', 'Preencha o CEP corretamente.');
            showFeedback('inputEndereco', 'feedback4', 'Preencha o endereço corretamente.');
            showFeedback('inputTelefone', 'feedback5', 'Preencha o telefone corretamente.');
            showFeedback('inputLogo', 'feedback6', 'Selecione a logo da instituição.');
            return;
        }

        try {
            const path = await armazenarLogo(logo, nome);
            const { data, error } = supabase.storage.from('logotipo').getPublicUrl(path);

            if (error) {
                showFeedback('inputLogo', 'feedback6', 'Erro ao obter URL da logo.');
                return;
            }

            const response = await axios.post('http://localhost:3001/instituicao/cadastrar', { userID: user.id, cnpj, nome, cep, endereco, telefone, logotipo: data.publicUrl });
            if (response.status === 200) {
                showToast('success', response.data.mensagem);
                setTimeout(() => window.location.href = '/verification', 5000);
            }
        } catch (error) {
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao cadastrar instituição.');
        }
    };

    const entrarInstituicao = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/instituicao/entrar', { id: user.id, codigo });
            if (response.status === 200) {
                showToast('success', 'Usuário vinculado a instituição com sucesso!');
                setTimeout(() => window.location.href = '/verification', 5000);
            }
        } catch (error) {
            showToast('error', error.response ? error.response.data.error : 'Erro ao vincular usuário a instituição.');
        }
    };

    const showFeedback = (inputId, feedbackId, message) => {
        document.getElementById(inputId).classList.add('is-invalid');
        document.getElementById(feedbackId).innerHTML = message;
        setTimeout(() => {
            document.getElementById(inputId).classList.remove('is-invalid');
            document.getElementById(feedbackId).innerHTML = '';
        }, 5000);
    };

    return (
        <>
            <div id='toast-container' className="toast-container position-fixed bottom-0 end-0 p-3"></div>
            <Header />
            <section id='section'>
                <div className="box">
                    <div className="title d-flex justify-content-between align-items-center">
                        <h3 className="m-0">Instituição de ensino</h3>
                        <span className='d-flex gap-3'>
                            <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#entrarEscola">Entrar em uma instituição</button>
                            <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#cadastrarEscola">Cadastrar uma nova instituição</button>
                        </span>
                    </div>
                </div>
            </section>

            <div className="modal fade" id="cadastrarEscola" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">Cadastrar uma nova instituição de ensino</h1>
                        </div>
                        <form onSubmit={cadastrarInstituicao}>
                            <div className="modal-body">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputCNPJ" placeholder="CNPJ" maxLength="18" value={cnpj} onChange={(e) => setCnpj(e.target.value)} onBlur={() => verificarCNPJ(cnpj)} required />
                                    <label htmlFor="inputCNPJ">CNPJ (apenas os números) </label>
                                    <div className="invalid-feedback" id="feedback1"></div>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputNome" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                    <label htmlFor="inputNome">Nome</label>
                                    <div className="invalid-feedback" id="feedback2"></div>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputCEP" placeholder="CEP" value={cep} onChange={(e) => setCEP(e.target.value)} onBlur={() => verificarCEP(cep)} required />
                                    <label htmlFor="inputCEP">CEP</label>
                                    <div className="invalid-feedback" id="feedback3"></div>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputEndereco" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
                                    <label htmlFor="inputEndereco">Endereço</label>
                                    <div className="invalid-feedback" id="feedback4"></div>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputTelefone" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                                    <label htmlFor="inputTelefone">Telefone</label>
                                    <div className="invalid-feedback" id="feedback5"></div>
                                </div>
                                <div className="mb-3 d-flex justify-content-center align-items-center gap-3">
                                    <div className="img-container">
                                        {logo ? (
                                            <img width={64} src={typeof logo === 'string' ? logo : URL.createObjectURL(logo)} alt="Logo" className="img-fluid" />
                                        ) : (
                                            <span></span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="form-label">Logo da instituição</label>
                                        <input type="file" className="form-control" id="inputLogo" onChange={(e) => setLogo(e.target.files[0])} />
                                        <div className="invalid-feedback" id="feedback6"></div>
                                    </div>
                                </div>
                                <hr />
                                <div className="text-center">
                                    <button type="button" className="btn btn-outline-secondary" data-bs-target="#entrarEscola" data-bs-toggle="modal">Entrar em uma instituição de ensino</button>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary">Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="entrarEscola" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">Entrar em uma instituição de ensino existente</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={entrarInstituicao}>
                            <div className="modal-body">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="inputCodigo" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
                                    <label htmlFor="inputCodigo">Código da instituição de ensino</label>
                                    <div className="invalid-feedback" id="feedback7"></div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" className="btn btn-primary">Entrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
