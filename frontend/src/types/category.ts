export interface Category {
    id: string;
    userId: string;
    nombre: string;
    icono?: string;
    color?: string;
    oculto?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
