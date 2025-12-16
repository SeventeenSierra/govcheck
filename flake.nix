# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

{
  description = "GovCheck - Federal Compliance Validation";

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
        devShells.default = pkgs.mkShellNoCC {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
            biome
            
            # E2E testing (Playwright)
            playwright

            # Optional: keep a stable tsc version handy
            nodePackages.typescript

            # Secret detection & history cleaning
            gitleaks
            git-filter-repo

            # Local Workflow Runners & Security
            act
            semgrep
            trivy
          ];

          shellHook = ''
            echo "🚀 GovCheck Dev Environment (Frontend)"
            echo "Node: $(node --version)"
            echo "pnpm: $(pnpm --version)"
            
            # Mimic IDX web preview command
            alias web='pnpm run dev -- --port ''${PORT:-3000} --hostname 0.0.0.0'
            echo "💡 Run 'web' to start the dev server (host: 0.0.0.0, port: \''${PORT:-3000})"
          '';
        };

      }
    );
}
