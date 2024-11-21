import { ChangeEvent, ClipboardEvent } from "react";
import { api } from "./api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

type ImgItemProps = {
  imgUrl: string;
};

const ImgItem = ({ imgUrl }: ImgItemProps) => {
  const queryClient = useQueryClient();

  const { isPending, mutate: delImg } = useMutation({
    mutationFn: async () => {
      const arr = imgUrl.split(`/`);
      const fileName = arr[arr.length - 1];
      const sha256 = fileName.split(`.`)[0];
      await api.delete(`/${sha256}`);
    },
    onError: (error) => {
      console.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getImgs"],
      });
    },
  });
  return (
    <div className="w-full border">
      <img src={imgUrl} className="w-full h-64 object-contain" />
      <div className="flex gap-4">
        <button
          onClick={() => {
            navigator.clipboard.writeText(imgUrl);
          }}
        >
          copy
        </button>
        <button
          disabled={isPending}
          onClick={() => {
            delImg();
          }}
        >
          delete
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const queryClient = useQueryClient();

  const { isPending: isUploadPending, mutate: upload } = useMutation({
    mutationFn: async (img: File) => {
      const formData = new FormData();
      formData.append("file", img);
      return api.post(`/upload`, formData);
    },
    onError: (error) => {
      console.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getImgs"],
      });
    },
  });

  const handleUploadImg = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const img = e.target.files?.[0];
      if (img) {
        upload(img);
      }
    } finally {
      e.target.value = "";
    }
  };

  const { isPending, isError, error, data } = useQuery({
    queryKey: ["getImgs"],
    queryFn: async () => {
      const res: AxiosResponse<string[]> = await api.get(`/imgs`);
      return res.data;
    },
  });

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith(`image`)) {
        const img = item.getAsFile();
        if (img) {
          upload(img);
        }
      }
    }
  };

  if (isPending) {
    return <p>loading</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="file" onChange={handleUploadImg} accept="image/*" />
      <div
        className="w-full h-64 border flex justify-center items-center"
        onPaste={isUploadPending ? undefined : handlePaste}
      >
        {isUploadPending ? `uploading` : `paste area`}
      </div>
      <div className="grid grid-cols-5 gap-4">
        {data.map((imgUrl) => {
          return <ImgItem key={imgUrl} imgUrl={imgUrl} />;
        })}
      </div>
    </div>
  );
};

export default App;
