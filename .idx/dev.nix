{ pkgs, ... }: {
  # Which nixpkgs channel to use. We use unstable to match the project's flake.nix.
  channel = "unstable";

  # This list is manually synchronized with the buildInputs in flake.nix
  # to ensure a consistent development environment inside IDX.
  packages = with pkgs; [
    nodejs_22
    pnpm
    biome
    python313
    python313Packages.pip
    python313Packages.uvicorn
    python313Packages.fastapi
    docker
    docker-compose
    podman
    podman-compose
    playwright
    nodePackages.typescript
    gitleaks
    git-filter-repo
    google-cloud-sdk
    act
    semgrep
    trivy
  ];

  # Sets environment variables in the workspace
  env = {};

  # Preserved from original config: Firebase emulators setup
  services.firebase.emulators = {
    detect = false;
    projectId = "demo-app";
    services = ["auth" "firestore"];
  };

  # Preserved from original config: IDX/VSCode settings
  idx = {
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          # This command now calls 'next' directly, avoiding the argument parsing
          # issue with 'pnpm run'. The 'next' command is available in the PATH
          # thanks to the Nix environment.
          command = ["next" "dev" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
