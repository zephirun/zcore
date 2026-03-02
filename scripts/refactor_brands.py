import re

file_path = 'src/pages/purchases/BrandsAndBuyers.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add RHF
imports = """import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
"""

content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + imports)

# Define Schemas
schema_code = """
const brandSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'O nome da marca deve ter pelo menos 2 caracteres'),
    website: z.string().optional(),
    logoUrl: z.string().optional()
});
"""

content = content.replace("const BrandsAndBuyers = () => {", schema_code + "\nconst BrandsAndBuyers = () => {")


# Form Data Hook Setup
client_form_data = """    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(brandSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            website: '',
            logoUrl: ''
        }
    });
    
    // We still keep the file state manually since it's an object not supported out of the box by simple text zod inputs
    const [logoFile, setLogoFile] = useState(null);
    const watchLogoUrl = watch('logoUrl');
    const watchName = watch('name');"""

content = re.sub(r'    // New Brand Form Data\n    const \[formData, setFormData\] = useState\(\{ name: \'\', website: \'\', logoUrl: \'\' \}\);\n', client_form_data, content, flags=re.DOTALL)


# Reset handling
brand_modal_open = """                        onClick={() => {
                            reset({ name: '', website: '', logoUrl: '' });
                            setLogoFile(null);
                            setSelectedBrand(null);
                            setIsModalOpen(true);
                        }}"""
content = re.sub(r'                        onClick=\(\(\) => \{\n                            setFormData\(\{ name: \'\', website: \'\', logoUrl: \'\' \}\);\n                            setSelectedBrand\(null\);\n                            setIsModalOpen\(true\);\n                        \}\)', brand_modal_open, content, flags=re.DOTALL)

brand_modal_edit = """                                        onClick={() => {
                                            reset({ 
                                                id: selectedBrand.id,
                                                name: selectedBrand.name, 
                                                website: selectedBrand.website || '', 
                                                logoUrl: selectedBrand.logo_url || '' 
                                            });
                                            setLogoFile(null);
                                            setIsModalOpen(true);
                                        }}"""
content = re.sub(r'                                        onClick=\(\(\) => \{\n                                            setFormData\(\{ \.\.\.selectedBrand, logoUrl: selectedBrand\.logo_url \|\| \'\' \}\);\n                                            setIsModalOpen\(true\);\n                                        \}\)', brand_modal_edit, content, flags=re.DOTALL)


# Submits logic rewrite
handleSave = """    const onFormSubmit = async (data) => {
        const payload = { ...data, logoFile };
        const result = await api.saveBrand(payload, logoFile);

        if (!result.success) {
            alert('Erro ao salvar marca: ' + result.error);
            return;
        }

        setIsModalOpen(false);
        reset({ name: '', website: '', logoUrl: '' });
        setLogoFile(null);
        loadBrands();
        if (selectedBrand && selectedBrand.id === data.id) {
            setSelectedBrand({ ...selectedBrand, ...data, logoFile: null });
        }
    };"""

content = re.sub(r'    const handleSaveBrand = async \(e\) => \{.*?selectedBrand\(\{ \.\.\.selectedBrand, \.\.\.formData, logoFile: null \}\); // basic update\n        \}\n    \};\n', handleSave, content, flags=re.DOTALL)


# HTML rewrite - form main
main_form = """                        <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>{watch('id') ? 'Editar Marca' : 'Nova Marca'}</h2>
                        <form onSubmit={handleSubmit(onFormSubmit)}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Nome da Marca</label>
                                <Input
                                    type="text"
                                    error={errors.name?.message}
                                    {...register('name')}
                                    style={{ width: '100%' }}
                                    placeholder="Ex: Nike, Adidas..."
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Website (Opcional)</label>
                                <Input
                                    type="url"
                                    error={errors.website?.message}
                                    {...register('website')}
                                    style={{ width: '100%' }}
                                    placeholder="https://..."
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Logo da Marca</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '12px',
                                        background: 'var(--bg-input)', border: '1px dashed var(--border-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {logoFile ? (
                                            <img src={URL.createObjectURL(logoFile)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : watchLogoUrl ? (
                                            <img src={watchLogoUrl} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Sem Logo</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                if (e.target.files[0]) {
                                                    setLogoFile(e.target.files[0]);
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '16px',
                                                border: '1px solid var(--border-input)',
                                                background: 'var(--bg-input)',
                                                color: 'var(--text-main)',
                                                fontSize: '13px'
                                            }}
                                        />
                                        <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            PNG, JPG ou WEBP (Max. 2MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}>Cancelar</Button>
                                <Button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '16px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Salvar</Button>
                            </div>
                        </form>"""

content = re.sub(r'                        <h2 style=\{\{ marginBottom: \'24px\', color: \'var\(--text-main\)\' \}\}>\{formData\.id \? \'Editar Marca\' : \'Nova Marca\'\}</h2>\n                        <form onSubmit=\{handleSaveBrand\}>.*?</form>', main_form, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
