import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'El correo es requerido')
        .email('Ingresa un correo válido'),
    password: z
        .string()
        .min(1, 'La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
    alias: z
        .string()
        .min(1, 'El alias es requerido')
        .min(2, 'El alias debe tener al menos 2 caracteres')
        .max(20, 'El alias no puede tener más de 20 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
    email: z
        .string()
        .min(1, 'El correo es requerido')
        .email('Ingresa un correo válido'),
    password: z
        .string()
        .min(1, 'La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
