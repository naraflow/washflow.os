import { useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";

export const useMachineTimer = () => {
  const machines = useDashboardStore((state) => state.machines);
  const updateMachine = useDashboardStore((state) => state.updateMachine);

  useEffect(() => {
    const interval = setInterval(() => {
      machines.forEach((machine) => {
        if (machine.status === "in-use" && machine.timer) {
          const startTime = machine.timer.startTime
            ? new Date(machine.timer.startTime).getTime()
            : Date.now();
          const duration = machine.timer.duration || 60;
          const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
          const remaining = Math.max(0, duration - elapsed);

          if (remaining <= 0) {
            // Auto-complete when timer reaches 0
            updateMachine(machine.id, {
              status: "completed",
              timer: undefined,
            });
          } else {
            // Update remaining time
            updateMachine(machine.id, {
              timer: {
                ...machine.timer,
                remaining,
              },
            });
          }
        }
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [machines, updateMachine]);
};

