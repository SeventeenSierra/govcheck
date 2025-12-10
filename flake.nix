{
  description = "Proposal Prepper (Contract Checker) - NSF PAPPG Compliance Validation";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
            biome
            
            # Python for strands-agent service
            python313
            python313Packages.pip
            python313Packages.uvicorn
            python313Packages.fastapi

            # E2E testing (Playwright)
            playwright

            # Optional: keep a stable tsc version handy
            nodePackages.typescript

            # Secret detection & history cleaning
            gitleaks
            git-filter-repo

            # GCP tools
            google-cloud-sdk

            # Local Workflow Runners & Security
            act
            semgrep
            trivy
          ];

          shellHook = ''
            echo "🚀 Proposal Prepper Dev Environment"
            echo "📋 NSF PAPPG Compliance Validation System"
            echo "Node: $(node --version)"
            echo "pnpm: $(pnpm --version)"
            echo ""
            echo "Services:"
            echo "  • Web (Next.js): Port 3000"
            echo "  • Strands (Python): Port 8080"
            echo "  • Genkit (Node.js): Port 8081"
          '';
        };
      }
    );
}
