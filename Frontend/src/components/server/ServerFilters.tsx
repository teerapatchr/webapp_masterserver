"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
};

export function ServerFilters(props: Props) {
    return (
        <div className="rounded-xl border p-6 space-y-4">
            <Input
                value={props.search}
                onChange={(e) => props.onSearchChange(e.target.value)}
                placeholder="Search by Server Name, IP Address, or Application Name"
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                    <div className="text-sm font-medium">Location</div>
                    <Select value={props.location} onValueChange={props.onLocationChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Locations</SelectItem>
                            <SelectItem value="ART">ART</SelectItem>
                            <SelectItem value="GBS">GBS</SelectItem>
                            <SelectItem value="HQ">HQ</SelectItem>
                            <SelectItem value="GBN">GBN</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

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
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

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
            </div>
        </div>
    );
}
