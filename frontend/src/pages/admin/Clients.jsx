const Clients = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Kelola Client</h1>
        <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">+ Tambah User</button>
        <table className="w-full table-auto bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Nama</th>
              <th className="p-2">Email</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="p-2">Budi</td>
              <td className="p-2">budi@mail.com</td>
              <td className="p-2">
                <button className="text-sm bg-green-500 text-white px-2 py-1 rounded">Jadikan User</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  
  export default Clients;
  