WebFont.load({
    google: {
        families: ['Press Start 2P']
    },
    active: e => {
        // pre-load the images
        app.loader.
            add([
                "assets/cannon.png",
                "assets/playerExplosion.png",
                "assets/octopus.png",
                "assets/crab.png",
                "assets/squid.png",
                "assets/bossImage.png",
                "assets/alienLaser.png",
                "assets/charge.png",
                "assets/snapEffect.png",
                "assets/beam.png",
                "assets/steamStart.png",
                "assets/steamLoop.png",
                "assets/alienExplosion.png",
                "assets/healthBar.png",
                "assets/barrier.png",
                "assets/barrierDestroyed.png",
                "assets/logo.png"
            ]);
        app.loader.onComplete.add(setup);
        app.loader.load();
    }
});