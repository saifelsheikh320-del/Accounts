import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export type SyncStatus = "online" | "offline" | "syncing" | "error" | "success";

export function useSync() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSync, setLastSync] = useState<Date | null>(() => {
        const saved = localStorage.getItem("lastSyncDate");
        return saved ? new Date(saved) : null;
    });
    const [status, setStatus] = useState<SyncStatus>(navigator.onLine ? "online" : "offline");

    // Fetch settings to get remote URL
    const { data: settings } = useQuery({
        queryKey: [api.settings.get.path],
        queryFn: async () => {
            const res = await fetch(api.settings.get.path);
            return res.json();
        }
    });

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setStatus("online");
            triggerSync();
        };
        const handleOffline = () => {
            setIsOnline(false);
            setStatus("offline");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const triggerSync = async () => {
        // === HARDCODED CLOUD URL ===
        // This makes the app "know" the site automatically
        const HARDCODED_URL = "https://smart-summary.replit.app";

        const remoteUrl = (settings as any)?.remoteUrl || HARDCODED_URL;

        if (!remoteUrl || !navigator.onLine) return;

        setStatus("syncing");

        try {
            console.log(`Starting Two-Way Sync with: ${remoteUrl}`);

            // 1. Fetch current local state
            const [localProductsRes, localPartnersRes, localTxsRes] = await Promise.all([
                fetch(api.products.list.path),
                fetch(api.partners.list.path),
                fetch(api.transactions.list.path)
            ]);

            const localData = {
                products: await localProductsRes.json(),
                partners: await localPartnersRes.json(),
                transactions: await localTxsRes.json()
            };

            // 2. Push Local to Remote & Get Remote State
            // We use the same endpoint on both sides
            const remoteSyncUrl = remoteUrl.endsWith('/') ? remoteUrl + 'api/sync/process' : remoteUrl + '/api/sync/process';

            const remoteSyncRes = await fetch(remoteSyncUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localData)
            });

            if (!remoteSyncRes.ok) throw new Error("Remote sync failed");
            const remoteData = await remoteSyncRes.json();

            // 3. Pull Remote State to Local
            const localSyncRes = await fetch(api.sync.process.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(remoteData.currentState)
            });

            if (!localSyncRes.ok) throw new Error("Local update failed");

            const now = new Date();
            setLastSync(now);
            localStorage.setItem("lastSyncDate", now.toISOString());
            setStatus("success");
            setTimeout(() => setStatus("online"), 3000);

            console.log("Two-Way Sync Completed Successfully");
        } catch (error) {
            console.error("Sync failed:", error);
            setStatus("error");
            setTimeout(() => setStatus("offline"), 5000);
        }
    };

    return {
        isOnline,
        lastSync,
        status,
        triggerSync,
        remoteUrl: (settings as any)?.remoteUrl
    };
}
