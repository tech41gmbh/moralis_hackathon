/** @format */

import { create } from 'ipfs-http-client';

export async function UploadToIpfs() {
  const client = create('https://ipfs.infura.io:5001/api/v0');
  var str = "{'some':'test'}";
  const added = await client.add(str);
}
