# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

{
  description = "Proposal Prepper (Contract Checker)";

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

            # Container runtime options
            docker
            docker-compose
            podman
            podman-compose

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
            echo "(pnpm $(pnpm --version), node $(node --version))"
          '';
        };
      }
    );
}
