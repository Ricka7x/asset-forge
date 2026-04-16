class AssetForge < Formula
  desc "The complete asset toolkit for developers"
  homepage "https://github.com/Ricka7x/asset-forge"
  url "https://registry.npmjs.org/@ricka7x/asset-forge/-/asset-forge-0.3.4.tgz"
  sha256 "PLACEHOLDER_NPM_TARBALL_SHA"

  depends_on "node"
  depends_on "ffmpeg"

  def install
    system "npm", "install", *std_npm_args(prefix: libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "the complete asset toolkit", shell_output("#{bin}/asset-forge --help")
  end
end
