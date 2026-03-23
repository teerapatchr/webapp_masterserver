"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { mdyToISO } from "./date";

export function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border p-4 space-y-3">
            <div className="text-sm font-semibold">{title}</div>
            {children}
        </div>
    );
}

export function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}) {
    const inputValue = type === "date" ? mdyToISO(value) : value;

    return (
        <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </div>
            <Input
                type={type}
                value={inputValue}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
}

export function SelectField({
    label,
    value,
    onValueChange,
    placeholder,
    options,
    required = false,
}: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    options: string[];
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </div>

            <Select value={value || undefined} onValueChange={onValueChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder || "Select option"} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}