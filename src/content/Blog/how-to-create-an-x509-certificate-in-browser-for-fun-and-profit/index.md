---
title: "How to Create an x509 Certificate in Browser for Fun and Profit"
description: From start to finish, this guide will show you how to create a valid x509 certificate at Akash Network, with ECDSA SHA-256 in Browser.

pubDate: "2021-07-14"
draft: false

categories:
  - Developers
tags:
  - Developers
contributors:
  - Derek Anderson

bannerImage: ./banner-image.png
---
From start to finish, this guide will show you how to create a valid x509 certificate at Akash Network, with ECDSA SHA-256 in Browser. 

If that statement alone sounds harrowing, it’s likely because this is the kind of stuff we generally don’t deal with as web developers. However, as front-end development quickly grows into full-stack app development, there are many areas we’ve not traditionally encountered that have been left to our back-end brethren. 

The key requirements of this task are to generate a key pair for signing and verification: Export the Private Key, Public Key, and Certificate in PEM format, so that they can be stored, or transported.

With Akash Network, we store the Certificate and the Public Key on-chain, so that others may verify an actor is connected to the funding source they claim to be a user of. We convert these PEM formats into uInt8 arrays to transport over protobuf.

When researching, I thought this would be a simple Internet search. However, a combination of missing and outdated information made it hard to find the information needed to get current algorithms to match the spec of the other client/server with which I wanted to communicate.

Let’s start with the easy stuff first.

### **Generating a Key Pair**

The most common case in which we do this today is either to validate our machine’s identity in place of a password, like Github, AWS Console, CryptoCoins, or Web Servers. Now, we’re going to generate one in the browser.

Luckily life is good, and Chrome and other browser vendors have a good start at implementing Cryptography libraries in the browser. We also have some good standardization libraries for dealing with Cryptography in multiple places. Two libraries we will lean on will be [pkijs](https://github.com/PeculiarVentures/PKI.js) and [asn1js](https://www.npmjs.com/package/asn1js).

Each of these libraries provides us with the needed methods/classes and types to deal with multiple aspects of a task. We can simply install these using your favorite package manager. These bundle well for modern web browsers. I’m also reaching for pvutils to simplify some of its utility used for encoding the certificates into text formats. This library isn’t needed in the whole cryptography portion, so feel free to swap the methods borrowed for your own preferred versions.

    npm i pkijs asn1js pvutils

Once the utilities are installed let’s get down to business by generating our first key pair!

    const { 
        getCrypto, 
        getAlgorithmParameters 
    } = require("pkijs/build");

We will use the getCrypto method here to give us a Cryptographic handler. In the browser, this generally maps to a window. SubtleCrypto could also infer to be window.crypto.webKitSubtle, window.crypto.subtle. The idea is that you will get the point of how JavaScript is standardized across the browser landscape. So we’ll use getCrypto to simplify.

We also need to grab getAlgorithmParameters, so that we can easily get the digest information around the specific encoding and decoding that needs to be done. This greatly simplifies our need to pull together information related to all the curves, hashing math, and more needed to make this work. Thankfully, you should have access to modern and current algorithms if you keep current with pkijs. This is where I’ll dispense a little advice, to stay away from prebuilt and browser bundles outside of a module ecosystem. You’ll find the possibility of them being outdated in a few years if you need to move forward with your cryptography.

Below is the stub of code that will generate a cryptographic keypair. Here, I am going to specify an ECDSA signature using SHA-256 hashing. You may need to change these based on your target environment.

    const crypto = getWebCrypto();
    const algo = getAlgorithmParameters("ECDSA", "generatekey");
    const keyPair = crypto.generateKey(algorithm.algorithm, true, algorithm.usages);

That’s it, you just generated a valid keypair! 

### **Generating Backups** 

The breakdown of the generateKey method, is algo, allowExport, and usage. Two of these are already defined thanks to the getAlgorithm method, and we’re free to determine if we want this keypair to be captured in code. In this case, we do, because we’re going to generate backups of these, we also need to use these keys to sign and generate a valid x509 certificate.

Generating the x509 is much simpler than I anticipated. The biggest hurdle was understanding the way in which OIDs are applied to certificate creation. Object IDs are used to identify fields and which kind of properties should be encoded into the certificate.

Using an OID repository like [OID Info](http://www.oid-info.com), you can find the OIDs for the fields you’ll need. There are a few common ones, like Organization, Country, and State that you can encode as well. The necessity for these fields are strictly determined by the consuming entity of the certificate. They are not needed to produce a valid certificate that can be used to verify and sign.

To generate the x509 we’ll grab a few more helpers from pkijs. We will also get types from asn1js, so we’ll bring that along for the ride as well.

    const {
        AttributeTypeAndValue,
        Certificate,
        BasicConstraints,
        Extension,
        ExtKeyUsage
    } = require("pkijs/build");
    const asn1js = require("asn1js");

The certificate class will be used to create the x509, and the other classes will be used to decorate and interact with the certificate. You may not need ExtKeyUsage, but we will go over it since the scenario fits into other places as well.

### **Creating a Certificate** 

Creating the actual certificate is super simple.

    const cert = new Certificate();

Now that we have a certificate in memory, we can get down to business and start to construct the needed fields of the certificate.

    cert.version = 2;
    cert.serialNumber = new asn1js.Integer({ value: Date.now() });

Again, any of these fields are optional. We can skip right down to signing the certificate which would make it completely valid for use, but the system you are interacting with may require additional fields and descriptions -- version and serialNumber are two that are very common.

They are otherwise boring fields but can be used by a validator to determine if the issuer of the certificate has changed it in any meaningful way. The version is 0 offset, and the serial number here is simply the issuing timestamp. This may need to be more aggressive depending on the use case (JWT replacement for example).

### **Exporting Private and Public Keys** 

To export the private key and public key, we are going to use two standards. The pkcs#8 standard, which means Public Key Cryptography Standards. The tl;dr of this is the base64 encoded versions of our key information. Combined with headers and footers as borders, with line breaks every 64bytes.

We’ll also use spki standard, which means we want our public key in a format easily exchangeable outside of the certificate. The purpose of spki is so that it allows for key validation outside of the certificate issuer.

Getting these two in binary from the browser is simple with just a couple of lines of code.

    const spki = await crypto.exportKey("spki", keyPair.privateKey);
    const pkcs8 = await crypto.exportKey("pkcs8", keyPair.privateKey);

### **Structuring Binary Outputs Into Text Form**

Now we need to structure these binary outputs into a text form with what we call boundaries. A boundary in this case is a text demarcation with a new line as seen below.

    -----BEGIN CERTIFICATE-----\n
    -----END CERTIFICATE-----

Between these two boundaries, we are going to put a base64 representation of our certificates and keys. Remember pvutils? It is time to reach for those helpers!

    const { arrayBufferToString, toBase64 } = require("pvutils");

We’ll also need to format the PEM files at the 64 byte line limit. This is really easy to do with a replacement regex.

    function formatPEM(pemString: any) {
       return pemString.replace(/(.{64})/g, "$1\n");
    }

### **The Home Stretch**

Let’s use these three helper methods together to convert the ArrayBuffers to Strings then we can Base64 encode those and format them for creating our PEM files!

    const pems = {
    csr: `-----BEGIN CERTIFICATE-----\n${formatPEM(
       toBase64(arrayBufferToString(certBER))
    )}\n-----END CERTIFICATE-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----\n${formatPEM(
       toBase64(arrayBufferToString(pkcs8))
    )}\n-----END PRIVATE KEY-----`,
    publicKey: `-----BEGIN EC PUBLIC KEY-----\n${formatPEM(
       toBase64(arrayBufferToString(spki))
    )}\n-----END EC PUBLIC KEY-----`,
    };

This bit of code uses the template literal to combine the boundaries in String format with the returned base64 encoding. What is left is an object that has 3 different PEM formatted files, these can be saved to memory or written to files for transportation. 

Happy signing!

Want to make this a bit easier or maybe looking for a way to generate certificates that are compatible with the Akash Network? Check out [AkashJS](http://github.com/ovrclk/akashjs), which aims to help simplify these tasks in Browser and under NodeJS.