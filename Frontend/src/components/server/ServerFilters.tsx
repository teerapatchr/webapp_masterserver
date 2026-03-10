"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type FilterKey =
    | "location"
    | "env"
    | "status"
    | "power"
    | "critical"
    | "createDate"
    | "decommissionDate"
    | "terminatedDate"
    ;
export type VisibleFilters = Record<FilterKey, boolean>;

export const DEFAULT_VISIBLE_FILTERS: VisibleFilters = {
    location: true,
    env: true,
    status: true,
    power: true,
    critical: false,
    createDate: false,
    decommissionDate: false,
    terminatedDate: false,
};

const FILTER_LABELS: Record<FilterKey, string> = {
    location: "Location",
    env: "System Environment",
    status: "Status",
    power: "Power State",
    critical: "Critical App",
    createDate: "Create Date",
    decommissionDate: "Decommission Date",
    terminatedDate: "Terminated Date",
};

type Props = {
    search: string;
    onSearchChange: (v: string) => void;

    location: string;
    onLocationChange: (v: string) => void;

    env: string;
    onEnvChange: (v: string) => void;

    status: string;
    onStatusChange: (v: string) => void;

    power: string;
    onPowerChange: (v: string) => void;

    critical: string;
    onCriticalChange: (v: string) => void;

    serverOwner: string;
    onServerOwnerChange: (v: string) => void;

    visibleFilters: VisibleFilters;
    onVisibleFiltersChange: (next: VisibleFilters) => void;

    createDateFrom: string;
    createDateTo: string;

    onCreateDateFromChange: (v: string) => void;
    onCreateDateToChange: (v: string) => void;

    decommissionDateFrom: string;
    decommissionDateTo: string;

    onDecommissionDateFromChange: (v: string) => void;
    onDecommissionDateToChange: (v: string) => void;

    terminatedDateFrom: string;
    terminatedDateTo: string;

    onTerminatedDateFromChange: (v: string) => void;
    onTerminatedDateToChange: (v: string) => void;

};

export function ServerFilters(props: Props) {
    const [customizeOpen, setCustomizeOpen] = useState(false);
    const filterKeys = useMemo(() => Object.keys(FILTER_LABELS) as FilterKey[], []);

    return (
        <div className="rounded-xl border p-6 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <div className="flex-1">
                    <Input
                        value={props.search}
                        onChange={(e) => props.onSearchChange(e.target.value)}
                        placeholder="Search by Server Name, IP Address, Application Name, or Owner"
                    />
                </div>

                <Button type="button" variant="outline" onClick={() => setCustomizeOpen(true)}>
                    Customize Filters
                </Button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {props.visibleFilters.location && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Location</div>
                        <Select value={props.location} onValueChange={props.onLocationChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Locations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Locations</SelectItem>
                                <SelectItem value="HQ">HQ</SelectItem>
                                <SelectItem value="OC">OC</SelectItem>
                                <SelectItem value="Azure">Azure</SelectItem>
                                <SelectItem value="ART">ART</SelectItem>
                                <SelectItem value="G2S">G2S</SelectItem>
                                <SelectItem value="SKL">SKL</SelectItem>
                                <SelectItem value="LKU">LKU</SelectItem>
                                <SelectItem value="SPH">SPH</SelectItem>
                                <SelectItem value="SRC">SRC</SelectItem>
                                <SelectItem value="AU">AU</SelectItem>
                                <SelectItem value="MLD">MLD</SelectItem>
                                <SelectItem value="RGN">RGN</SelectItem>
                                <SelectItem value="ZPQ">ZPQ</SelectItem>
                                <SelectItem value="ZOC">ZOC</SelectItem>
                                <SelectItem value="YDNRGN">YDNRGN</SelectItem>
                                <SelectItem value="YDNYAD">YDNYAD</SelectItem>
                                <SelectItem value="YDNPLC">YDNPLC</SelectItem>
                                <SelectItem value="KUL">KUL</SelectItem>
                                <SelectItem value="KIK">KIK</SelectItem>
                                <SelectItem value="LAB">LAB</SelectItem>
                                <SelectItem value="BORF">BORF</SelectItem>
                                <SelectItem value="BTU">BTU</SelectItem>
                                <SelectItem value="FLNG">FLNG</SelectItem>
                                <SelectItem value="PSRC">PSRC</SelectItem>

                            </SelectContent>
                        </Select>
                    </div>
                )}


                {props.visibleFilters.env && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">System Environment</div>
                        <Select value={props.env} onValueChange={props.onEnvChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Environments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Environments</SelectItem>
                                <SelectItem value="PRD">PRD</SelectItem>
                                <SelectItem value="DEV">DEV</SelectItem>
                                <SelectItem value="QAS">QAS</SelectItem>
                                <SelectItem value="UAT">UAT</SelectItem>
                                <SelectItem value="POC">POC</SelectItem>
                                <SelectItem value="Test">Test</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}


                {props.visibleFilters.status && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Status</div>
                        <Select value={props.status} onValueChange={props.onStatusChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="Operation">Operation</SelectItem>
                                <SelectItem value="Decommissioning">Decommissioning</SelectItem>
                                <SelectItem value="Terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {props.visibleFilters.power && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Power State</div>
                        <Select value={props.power} onValueChange={props.onPowerChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="All States" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All States</SelectItem>
                                <SelectItem value="Power On">On</SelectItem>
                                <SelectItem value="Power Off">Off</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {props.visibleFilters.critical && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Critical App</div>
                        <Select value={props.critical} onValueChange={props.onCriticalChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All</SelectItem>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {props.visibleFilters.createDate && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Create Date</div>

                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={props.createDateFrom}
                                onChange={(e) => props.onCreateDateFromChange(e.target.value)}
                            />

                            <Input
                                type="date"
                                value={props.createDateTo}
                                onChange={(e) => props.onCreateDateToChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {props.visibleFilters.decommissionDate && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Decommission Date</div>

                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={props.decommissionDateFrom}
                                onChange={(e) => props.onDecommissionDateFromChange(e.target.value)}
                            />

                            <Input
                                type="date"
                                value={props.decommissionDateTo}
                                onChange={(e) => props.onDecommissionDateToChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {props.visibleFilters.terminatedDate && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Terminated Date</div>

                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={props.terminatedDateFrom}
                                onChange={(e) => props.onTerminatedDateFromChange(e.target.value)}
                            />

                            <Input
                                type="date"
                                value={props.terminatedDateTo}
                                onChange={(e) => props.onTerminatedDateToChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}

            </div>
            <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Customize Filters</DialogTitle>
                        <DialogDescription>
                            Choose which filters appear. Hidden filters will reset to ALL.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {filterKeys.map((key) => (
                            <label
                                key={key}
                                className="flex items-center justify-between rounded-lg border px-3 py-2"
                            >
                                <div className="text-sm font-medium">{FILTER_LABELS[key]}</div>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={props.visibleFilters[key]}
                                    onChange={(e) => {
                                        props.onVisibleFiltersChange({
                                            ...props.visibleFilters,
                                            [key]: e.target.checked,
                                        });
                                    }}
                                />
                            </label>
                        ))}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => props.onVisibleFiltersChange(DEFAULT_VISIBLE_FILTERS)}
                        >
                            Reset
                        </Button>
                        <Button type="button" onClick={() => setCustomizeOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
