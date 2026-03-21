class AssetForge < Formula
  desc "The complete asset toolkit for developers"
  homepage "https://github.com/YOUR_USERNAME/asset-forge"
  version "0.1.0"

  depends_on "imagemagick"
  depends_on "ffmpeg"

  on_macos do
    on_arm do
      url "https://github.com/YOUR_USERNAME/asset-forge/releases/download/v#{version}/asset-forge-darwin-arm64"
      sha256 "PLACEHOLDER_ARM64_SHA256"
    end
    on_intel do
      url "https://github.com/YOUR_USERNAME/asset-forge/releases/download/v#{version}/asset-forge-darwin-x64"
      sha256 "PLACEHOLDER_X64_SHA256"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/YOUR_USERNAME/asset-forge/releases/download/v#{version}/asset-forge-linux-x64"
      sha256 "PLACEHOLDER_LINUX_SHA256"
    end
  end

  resource "scripts" do
    url "https://github.com/YOUR_USERNAME/asset-forge/releases/download/v#{version}/scripts.tar.gz"
    sha256 "PLACEHOLDER_SCRIPTS_SHA256"
  end

  def install
    os   = OS.mac? ? "darwin" : "linux"
    arch = Hardware::CPU.arm? ? "arm64" : "x64"
    bin.install "asset-forge-#{os}-#{arch}" => "asset-forge"

    scripts_dir = libexec/"asset-forge/scripts"
    scripts_dir.mkpath
    resource("scripts").stage { scripts_dir.install Dir["*"] }
  end

  test do
    assert_match "asset-forge", shell_output("#{bin}/asset-forge --help")
  end
end
