import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
  server: {
    port: 8100,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          eagleeye: ["./src/components/EagleEyeV2.tsx", "./src/components/EagleEyeScoutDashboard.tsx", "./src/components/EagleEyeSignalDetail.tsx", "./src/components/EagleEyeHeatMap.tsx"],
          hawkeye: ["./src/components/HawkeyePlacementScout.tsx"],
          bonddesk: ["./src/components/bond-desk/BondDeskPage.tsx"],
          bondstructuring: ["./src/components/bond-desk/BondStructuringEngine.tsx"],
          cmbs: ["./src/components/bond-desk/CMBSStackingDesk.tsx"],
          phoenix: ["./src/components/PhoenixDesk.tsx"],
          roots: ["./src/components/RootsWorkspace.tsx", "./src/components/RootsDocumentVault.tsx"],
          boxing: ["./src/components/BoxingOutTracker.tsx"],
          agents: ["./src/components/LiveAgentDashboard.tsx", "./src/components/AnimatedAgentPlatform.tsx"],
          marketing: ["./src/components/MarketingStudio.tsx", "./src/components/BullseyePitchEngine.tsx"],
          construction: ["./src/components/ConstructionTracker.tsx", "./src/components/PermitTracker.tsx"],
          deposits: ["./src/components/ClientDepositPlatform.tsx", "./src/components/ClientSubmissionPortal.tsx"],
          convergence: ["./src/components/ConvergenceRadar.tsx", "./src/components/CentralNervousSystem.tsx"],
          bernard: ["./src/components/BernardConcierge.tsx", "./src/components/Bernard.tsx"],
          surety: ["./src/components/CompleteSuretyModule.tsx"],
          rating: ["./src/components/RatingIntelligence.tsx"],
          compliance: ["./src/components/KYCCompliance.tsx", "./src/components/NightVisionComplianceLair.tsx"],
          treasury: ["./src/components/TreasuryDesk.tsx"],
          signals: ["./src/components/SignalIntelligenceFeed.tsx", "./src/components/BondIntelligence.tsx"],
        },
      },
    },
  },
});
