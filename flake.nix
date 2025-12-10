{
  description = "Baryonic Ionosphere Monorepo";

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
            echo "🚀 17s Dev Environment"
            echo "Node: $(node --version)"
            echo "pnpm: $(pnpm --version)"
          '';
        };
      }
    );
}
