import qrcode

img = qrcode.make("https://main--chimerical-faun-76d702.netlify.app/")
img.save("img.png")
