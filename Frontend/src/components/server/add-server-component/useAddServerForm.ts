"use client";

import { useMemo, useState } from "react";
import type React from "react";
import type { FormState } from "@/lib/server/add-server.types";
import { EMPTY } from "@/lib/server/add-server.types";
import { REQUIRED_FIELDS } from "./config";
import { isoToMDY } from "./date";

export function useAddServerForm() {
    const [form, setForm] = useState<FormState>(EMPTY);

    const setField =
        (key: keyof FormState) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                }));
            };

    const setSelectField =
        (key: keyof FormState) =>
            (value: string) => {
                setForm((prev) => ({
                    ...prev,
                    [key]: value,
                }));
            };

    const setDateField =
        (key: keyof FormState) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({
                    ...prev,
                    [key]: isoToMDY(e.target.value),
                }));
            };

    const reset = () => setForm(EMPTY);

    const requiredOk = useMemo(() => {
        return REQUIRED_FIELDS.every((key) => form[key].trim() !== "");
    }, [form]);

    return {
        form,
        setField,
        setSelectField,
        setDateField,
        reset,
        requiredOk,
    };
}