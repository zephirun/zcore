import React from 'react';
import Input from '../../components/ui/Input';
import { Search } from 'lucide-react';

export default {
    title: 'UI Base/Input',
    component: Input,
    parameters: {
        docs: {
            description: {
                component: 'The standard text field input component for ZCORE forms. Includes a specialized FormField wrapper for labels, hints, and error messaging.',
            },
        },
    },
    argTypes: {
        label: {
            control: 'text',
            description: 'Top label managed by the FormField wrapper.',
        },
        placeholder: {
            control: 'text',
        },
        hint: {
            control: 'text',
            description: 'Helper text displayed below the input.',
        },
        error: {
            control: 'text',
            description: 'Error message. If provided, turns the input red.',
        },
        required: {
            control: 'boolean',
            description: 'Appends a required asterisk to the label.',
        },
        fullWidth: {
            control: 'boolean',
        },
        disabled: {
            control: 'boolean',
        }
    },
};

const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
    label: 'Nome do Fornecedor',
    placeholder: 'Ex: Indústrias Acme...',
    fullWidth: false,
};

export const RequiredField = Template.bind({});
RequiredField.args = {
    label: 'CNPJ',
    placeholder: '00.000.000/0000-00',
    required: true,
    fullWidth: false,
};

export const WithHint = Template.bind({});
WithHint.args = {
    label: 'Código de Integração',
    placeholder: 'ABC-123',
    hint: 'Não inclua traços ou pontos caso use o formato legado.',
    fullWidth: false,
};

export const WithError = Template.bind({});
WithError.args = {
    label: 'E-mail Corporativo',
    value: 'usuario@invalido',
    error: 'O formato de e-mail é inválido. Use @zcore.com',
    fullWidth: false,
};

export const WithInlineIconSearch = (args) => (
    <div style={{ position: 'relative', width: '300px' }}>
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }}>
            <Search size={16} />
        </div>
        <Input placeholder="Buscar módulos ou pedidos..." style={{ paddingLeft: '36px' }} {...args} />
    </div>
);
